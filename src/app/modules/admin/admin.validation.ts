import { z } from "zod";
import { IsActive } from "../user/user.interface";

const contactUsZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    subject: z.string({ required_error: "Subject is required" }),
    message: z.string({ required_error: "Message is required" }),
  }),
});
const updateUserStatusZodSchema = z.object({
  body: z.object({
    isActive: z.nativeEnum(IsActive, { required_error: "Status is required" }),
  }),
});

export const AdminValidations = {
  contactUsZodSchema,
  updateUserStatusZodSchema,
};
