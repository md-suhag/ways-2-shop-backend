import { z } from "zod";

const createServiceZodSchema = z.object({
  body: z.object({
    description: z.string({ required_error: "Description is required" }),
    ratePerHour: z
      .string({ required_error: "Rate per hour is required" })
      .regex(/^\d+(\.\d{1,2})?$/, {
        message: "Rate per hour must be a valid number",
      })
      .transform((val) => parseFloat(val))
      .refine((val) => val > 0, {
        message: "Rate per hour must be greater than 0",
      }),
    category: z.string({ required_error: "category is required" }),
  }),
});

export const ServiceValidations = { createServiceZodSchema };
