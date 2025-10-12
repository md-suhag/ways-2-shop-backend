import { z } from "zod";
import { BillingCycle } from "./package.interface";

const createPackageZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string().optional(),
    price: z.number({ required_error: "Price is required" }),
    durationInDays: z.number({ required_error: "Duration is required" }),
    billingCycle: z.nativeEnum(BillingCycle, {
      required_error: "Billing cycle is required",
    }),
    googleProductId: z.string({
      required_error: "Google Product ID is required",
    }),
    appleProductId: z.string({
      required_error: "Apple Product ID is required",
    }),
    features: z.array(z.string()).optional(),
  }),
});

const updatePackageZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    durationInDays: z.number().optional(),
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    googleProductId: z.string().optional(),
    appleProductId: z.string().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const PackageValidation = {
  createPackageZodSchema,
  updatePackageZodSchema,
};
