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
  body: z.object({
    coordinates: z.object({
      type: z.literal("Point", {
        errorMap: () => ({
          message: "Coordinates type must be 'Point'",
        }),
      }),
      coordinates: z
        .tuple([
          z
            .number({
              required_error: "Longitude is required",
              invalid_type_error: "Longitude must be a number",
            })
            .min(-180)
            .max(180),
          z
            .number({
              required_error: "Latitude is required",
              invalid_type_error: "Latitude must be a number",
            })
            .min(-90)
            .max(90),
        ])
        .refine(
          (coords) => coords.length === 2,
          "Coordinates must be [longitude, latitude]"
        ),
    }),
  }),
});

export const ServiceValidations = {
  createServiceZodSchema,
  getAllServiceZodSchema,
};
