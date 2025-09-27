import { z } from "zod";

const reviewZodSchema = z.object({
  body: z.object({
    provider: z.string({ required_error: "Provider id is required" }),
    service: z.string({ required_error: "Service id is required" }),
    rating: z.number({ required_error: "Rating is required" }),
    comment: z.string({ required_error: "Comment is required" }),
  }),
});

export const ReviewValidation = { reviewZodSchema };
