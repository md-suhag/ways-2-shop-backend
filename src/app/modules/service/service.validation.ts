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
    locationName: z.string({ required_error: "Location name is required" }),

    latitude: z
      .number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number",
      })
      .min(-90)
      .max(90),
    longitude: z
      .number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number",
      })
      .min(-180)
      .max(180),
  }),
});
const getAllServiceZodSchema = z.object({
  query: z
    .object({
      latitude: z
        .string()
        .optional()
        .refine(
          (val) => !val || !isNaN(parseFloat(val)),
          "Latitude must be a number"
        ),
      longitude: z
        .string()
        .optional()
        .refine(
          (val) => !val || !isNaN(parseFloat(val)),
          "Longitude must be a number"
        ),
      distance: z
        .string()
        .optional()
        .refine(
          (val) => !val || !isNaN(parseFloat(val)),
          "Distance must be a number"
        ),
    })
    .refine(
      (data) => (!data.latitude && !data.longitude ? true : !!data.distance),
      "Distance is required if latitude or longitude is provided"
    ),
});

export const ServiceValidations = {
  createServiceZodSchema,
  getAllServiceZodSchema,
};
