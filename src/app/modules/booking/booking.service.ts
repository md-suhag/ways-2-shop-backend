/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Service } from "../service/service.model";
import { calculatePrice } from "../../../util/calculatePrice";
import { Booking } from "./booking.model";
import {
  IBooking,
  IBookingStatus,
  IPaymentStatus,
  IPaymentType,
} from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";
import stripe from "../../../config/stripe";
import { generateOrderId } from "../../../util/generateOrderId";
import { checkTimeSlotAvailability } from "../../../util/checkTimeSlotAvailability";
import mongoose from "mongoose";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { NOTIFICATION_TYPE } from "../notification/notification.constants";
import { User } from "../user/user.model";
import config from "../../../config";
import { Wallet } from "../wallet/wallet.model";

const createBooking = async (payload: Partial<IBooking>, user: JwtPayload) => {
  const serviceData = await Service.findOne({
    _id: payload.service,
    isActive: true,
  });
  if (!serviceData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  // Check time slot availability
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

  // Start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (payload.paymentType === "ONLINE") {
      //  Create Stripe Checkout Session
      const sessionStripe = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(bookingPrice * 100),
              product_data: {
                name: "Service Booking",
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${config.frontend_url}/booking-success`,
        cancel_url: `${config.frontend_url}/booking-failed`,
        metadata: {
          customerId: user.id.toString(),
          providerId: payload.provider?.toString() || "",
          orderId: payload.orderId,
        },
      });

      //  Save booking with pending payment
      payload.transactionId = sessionStripe.id;

      await Booking.create([payload], { session });

      await session.commitTransaction();
      session.endSession();

      return { checkoutUrl: sessionStripe.url };
    } else {
      //  COD Booking
      await Booking.create([payload], { session });

      await session.commitTransaction();
      session.endSession();

      // Notify admin
      const admin = await User.findOne({
        email: config.super_admin.email,
      })
        .select("_id")
        .lean();

      await sendNotifications({
        type: NOTIFICATION_TYPE.BOOKING,
        title: "New Booking Created",
        message: "A new booking has been created successfully.",
        receiver: admin!._id,
      });

      return null;
    }
  } catch (error) {
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
    if (booking.paymentStatus !== IPaymentStatus.PAID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid request");
    }
    booking.status = IBookingStatus.COMPLETED;

    await booking.save();

    await Wallet.addBalance(booking.provider, booking.netPrice!);

    await sendNotifications({
      type: NOTIFICATION_TYPE.BOOKING,
      title: "Booking Completed",
      message: `Booking Completed. Order Id : ${booking.orderId}`,
      receiver: booking.provider._id,
      referenceId: booking._id.toString(),
    });
  } else {
    booking.status = IBookingStatus.COMPLETED;
    booking.paymentStatus = IPaymentStatus.PAID;
    await booking.save();

    await sendNotifications({
      type: NOTIFICATION_TYPE.BOOKING,
      title: "Booking Completed",
      message: `Booking Completed. Order Id : ${booking.orderId}`,
      receiver: booking.provider._id,
      referenceId: booking._id.toString(),
    });
  }
};

const getCustomerBookings = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const bookingQuery = new QueryBuilder(
    Booking.find({
      customer: user.id,
      $or: [
        {
          paymentType: IPaymentType.COD,
        },
        {
          paymentType: IPaymentType.ONLINE,
          paymentStatus: { $ne: IPaymentStatus.PENDING },
        },
      ],
    })
      .select("provider price bookingDate startTime orderId")
      .populate({
        path: "provider",
        select: "name businessCategory profile location.locationName",
        populate: {
          path: "businessCategory",
          select: "name -_id",
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
    Booking.find({
      provider: user.id,
      $or: [
        {
          paymentType: IPaymentType.COD,
        },
        {
          paymentType: IPaymentType.ONLINE,
          paymentStatus: {
            $in: [IPaymentStatus.PAID, IPaymentStatus.TRANSFERRED],
          },
        },
      ],
    })
      .select("customer bookingDate startTime")
      .populate({
        path: "customer",
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
      $or: [
        {
          paymentType: IPaymentType.COD,
        },
        {
          paymentType: IPaymentType.ONLINE,
          paymentStatus: { $ne: IPaymentStatus.PENDING },
        },
      ],
    })
      .select("customer startTime")
      .populate({
        path: "customer",
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
      .select("customer")
      .populate({
        path: "customer",
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
