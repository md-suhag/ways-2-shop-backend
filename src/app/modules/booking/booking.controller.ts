import { Request, Response } from "express";
import { BookingServices } from "./booking.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  let images: string[] = [];

  if (req.files && "image" in req.files) {
    images = (req.files.image as Express.Multer.File[]).map(
      (file) => `/images/${file.filename}`
    );
  }
  const data = {
    images,
    ...req.body,
  };
  const result = await BookingServices.createBooking(
    data,
    req.user as JwtPayload
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getSingleBooking(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.updateBookingStatus(
    req.params.id,
    req.user as JwtPayload,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

const getCustomerBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getCustomerBookings(
    req.user as JwtPayload,
    req.query
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Customer Bookings retrieved successfully",
    data: result.bookings,
    pagination: result.pagination,
  });
});
const getProviderBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getProviderBookings(
    req.user as JwtPayload,
    req.query
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Provider Bookings retrieved successfully",
    data: result.bookings,
    pagination: result.pagination,
  });
});
const getUpcomingBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingServices.getUpcomingBookings(
    req.user as JwtPayload,
    req.query
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Provider Upcoming Bookings retrieved successfully",
    data: result.bookings,
    pagination: result.pagination,
  });
});

export const BookingController = {
  createBooking,
  getSingleBooking,
  updateBookingStatus,
  getCustomerBookings,
  getProviderBookings,
  getUpcomingBookings,
};
