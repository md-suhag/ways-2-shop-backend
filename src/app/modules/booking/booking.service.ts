/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Service } from "../service/service.model";
import { calculatePrice } from "../../../util/calculatePrice";
import { Booking } from "./booking.model";
import { IBooking, IBookingStatus, IPaymentStatus } from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";
import stripe from "../../../config/stripe";
import { generateOrderId } from "../../../util/generateOrderId";
import { checkTimeSlotAvailability } from "../../../util/checkTimeSlotAvailability";
import mongoose from "mongoose";

const createBooking = async (payload: Partial<IBooking>, user: JwtPayload) => {
  const serviceData = await Service.findOne({
    _id: payload.service,
    isActive: true,
  });
  if (!serviceData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "service not found");
  }

  //  Check if slot available
  const isAvailable = await checkTimeSlotAvailability(
    payload.provider!,
    payload.bookingDate!,
    payload.startTime!,
    payload.endTime!
  );

  if (!isAvailable) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "This time slot is already booked! Please choose a different time."
    );
  }

  const bookingPrice = calculatePrice(
    serviceData.ratePerHour,
    payload.startTime as unknown as string,
    payload.endTime as unknown as string
  );
  payload.customer = user.id;
  payload.price = bookingPrice;
  payload.orderId = generateOrderId();
  payload.paymentStatus = IPaymentStatus.PENDING;

  //  Start transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (payload.paymentType === "ONLINE") {
      // 1️ Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: bookingPrice * 100,
        currency: "usd",
        metadata: {
          customerId: user.id.toString(),
          providerId: payload.provider?.toString() || "",
          orderId: payload.orderId,
        },
      });

      payload.stripePaymentIntentId = paymentIntent.id;

      // 2️ Create booking within transaction
      await Booking.create([payload], { session });

      // 3️ Commit transaction
      await session.commitTransaction();
      session.endSession();

      return { clientSecret: paymentIntent.client_secret };
    } else {
      // COD booking
      await Booking.create([payload], { session });
      await session.commitTransaction();
      session.endSession();

      return null;
    }
  } catch (error) {
    //  Rollback if anything fails
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getSingleBooking = async (id: string) => {
  const booking = await Booking.findById(id)
    .select("-stripePaymentIntentId")
    .populate({
      path: "provider",
      select: "name businessCategory profile location.locationName",
      populate: {
        path: "businessCategory",
        select: "name",
      },
    })

    .lean();
  return booking;
};

const completeBooking = async (id: string, user: JwtPayload) => {
  const booking = await Booking.findById(id).populate(
    "provider",
    "stripeAccountId"
  );

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }
  if (booking.customer.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You are not authorized to update this booking"
    );
  }

  if (booking.status === IBookingStatus.COMPLETED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already completed");
  }

  if (booking.paymentType === "ONLINE") {
    const transfer = await stripe.transfers.create({
      amount: booking.price * 100,
      currency: "usd",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      destination: (booking.provider as any).stripeAccountId,
      source_transaction: booking.stripePaymentIntentId,
    });

    booking.status = IBookingStatus.COMPLETED;
    booking.stripeTransferId = transfer.id;
    await booking.save();
  } else {
    booking.status = IBookingStatus.COMPLETED;
    booking.paymentStatus = IPaymentStatus.PAID;
    await booking.save();
  }
};

const getCustomerBookings = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({ customer: user.id })
      .select("provider price bookingDate startTime txId")
      .populate({
        path: "provider",
        select: "name businessCategory profile location.locationName",
        populate: {
          path: "businessCategory",
          select: "name",
        },
      }),
    query
  )
    .paginate()
    .filter()
    .sort();

  const [bookings, pagination] = await Promise.all([
    bookingQuery.modelQuery.lean(),
    bookingQuery.getPaginationInfo(),
  ]);
  return { bookings, pagination };
};
const getProviderBookings = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({ provider: user.id })
      .select("provider bookingDate startTime")
      .populate({
        path: "provider",
        select: "name  profile location.locationName",
      }),
    query
  )
    .paginate()
    .filter()
    .sort();

  const [bookings, pagination] = await Promise.all([
    bookingQuery.modelQuery.lean(),
    bookingQuery.getPaginationInfo(),
  ]);
  return { bookings, pagination };
};
const getUpcomingBookings = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const now = new Date();
  const bookingQuery = new QueryBuilder(
    Booking.find({
      provider: user.id,
      startTime: { $gte: now },
    })
      .select("provider startTime")
      .populate({
        path: "provider",
        select: "name  profile location.locationName",
      }),
    query
  )
    .paginate()
    .filter()
    .sort();

  const [bookings, pagination] = await Promise.all([
    bookingQuery.modelQuery.lean(),
    bookingQuery.getPaginationInfo(),
  ]);
  return { bookings, pagination };
};
const getCompletedBookings = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({
      provider: user.id,
      status: IBookingStatus.COMPLETED,
    })
      .select("provider")
      .populate({
        path: "provider",
        select: "name  profile location.locationName",
      })
      .populate({
        path: "review",
        select: "rating -booking -_id",
      }),
    query
  )
    .paginate()
    .filter()
    .sort();

  const [bookings, pagination] = await Promise.all([
    bookingQuery.modelQuery.lean(),
    bookingQuery.getPaginationInfo(),
  ]);
  return { bookings, pagination };
};

export const BookingServices = {
  createBooking,
  getSingleBooking,
  completeBooking,
  getCustomerBookings,
  getProviderBookings,
  getUpcomingBookings,
  getCompletedBookings,
};
