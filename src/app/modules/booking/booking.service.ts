import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Service } from "../service/service.model";
import { calculatePrice } from "../../../util/calculatePrice";
import { Booking } from "./booking.model";
import { IBooking, IBookingStatus } from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";

const createBooking = async (payload: IBooking, user: JwtPayload) => {
  const serviceData = await Service.findById(payload.service);
  if (!serviceData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "service not found");
  }

  payload.price = calculatePrice(
    serviceData.ratePerHour,
    payload.startTime,
    payload.endTime
  );
  payload.customer = user.id;
  const booking = await Booking.create(payload);

  return booking;
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

export const BookingServices = {
  createBooking,
  getSingleBooking,
  updateBookingStatus,
  getCustomerBookings,
  getProviderBookings,
  getUpcomingBookings,
};
