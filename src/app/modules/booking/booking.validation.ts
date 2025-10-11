import { z } from "zod";
import { IBookingStatus } from "./booking.interface";

const createBookingZodSchema = z.object({
  body: z.object({
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
  }),
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
