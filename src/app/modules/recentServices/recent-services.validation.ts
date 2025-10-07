import { z } from "zod";

// create recent companies validations here
const createRecentServicesZodSchema = z.object({
  body: z
    .object({
      service: z
        .string({ required_error: "Service ID is required" })
        .nonempty("Service ID cannot be empty"),
    })
    .strict(),
});

export const RecentServicesValidations = { createRecentServicesZodSchema };
