import { z } from "zod";

const createIntentZodSchema = z.object({
  body: z.object({
    bookingId: z.string({ required_error: "Booking Id is required" }),
  }),
});

export const PaymentValidations = { createIntentZodSchema };
