import { z } from "zod";
import { IBookingStatus } from "./booking.interface";

const createBookingZodSchema = z.object({
  body: z
    .object({
      service: z.string({ required_error: "Service ID is required" }),
      provider: z.string({ required_error: "Provider ID is required" }),
      location: z.object({
        locationName: z.string({ required_error: "Location name is required" }),
        coordinates: z.object({
          lat: z.number({ required_error: "Latitude is required" }),
          lng: z.number({ required_error: "Longitude is required" }),
        }),
      }),
      bookingDate: z
        .string({ required_error: "Booking date is required" })
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
      startTime: z
        .string({ required_error: "Start time is required" })
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
      endTime: z
        .string({ required_error: "End time is required" })
        .refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
      paymentType: z.enum(["ONLINE", "COD"], {
        required_error: "Payment type is required",
      }),
      notes: z.string().optional().default(""),
    })
    .refine(
      (data) => {
        const bookingDate = new Date(data.bookingDate);
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);

        const isSameDate = (d1: Date, d2: Date) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        return (
          isSameDate(bookingDate, startTime) && isSameDate(bookingDate, endTime)
        );
      },
      {
        message:
          "Booking date, start time, and end time must be on the same day",
        path: ["bookingDate"],
      }
    ),
});

const updateBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(IBookingStatus, {
      required_error: "Status is required",
    }),
  }),
});
export const BookingValidations = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
};
