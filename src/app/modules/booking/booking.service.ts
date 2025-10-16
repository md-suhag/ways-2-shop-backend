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

const createBooking = async (payload: Partial<IBooking>, user: JwtPayload) => {
  const serviceData = await Service.findOne({
    _id: payload.service,
    isActive: true,
  });
  if (!serviceData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "service not found");
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

  if (payload.paymentType === "ONLINE") {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bookingPrice * 100,
      currency: "usd",
      metadata: {
        customerId: user.id.toString(),
        providerId: payload.provider ? payload.provider.toString() : null,
        orderId: payload.orderId,
      },
    });
    payload.stripePaymentIntentId = paymentIntent.id;

    await Booking.create(payload);
    return { clientSecret: paymentIntent.client_secret };
  } else {
    // COD booking
    await Booking.create(payload);

    return null;
  }
};

const getSingleBooking = async (id: string) => {
  const booking = await Booking.findById(id)
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

const updateBookingStatus = async (
  id: string,
  user: JwtPayload,
  payload: IBookingStatus
) => {
  const booking = await Booking.findById(id);

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

  return await Booking.findByIdAndUpdate(
    id,
    { payload },
    { new: true, runValidators: true }
  ).lean();
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
  updateBookingStatus,
  getCustomerBookings,
  getProviderBookings,
  getUpcomingBookings,
  getCompletedBookings,
};
