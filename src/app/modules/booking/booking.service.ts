import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Service } from "../service/service.model";
import { calculatePrice } from "../../../util/calculatePrice";
import { Booking } from "./booking.model";
import { IBooking } from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";

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

export const BookingServices = { createBooking };
