import { z } from "zod";
import { SubscriptionPlatform } from "./subscription.interface";

export const verifySubscriptionZodSchema = z.object({
  body: z
    .object({
      platform: z.nativeEnum(SubscriptionPlatform, {
        required_error: "Platform is required",
      }),
      productId: z.string().optional(),
      purchaseToken: z.string().optional(),
      receiptData: z.string().optional(),
      userId: z
        .string({
          required_error: "User ID is required",
        })
        .min(1, "User ID is required"),
    })
    // Conditional validation:
    .superRefine((data, ctx) => {
      if (data.platform === SubscriptionPlatform.GOOGLE) {
        if (!data.productId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["productId"],
            message: "Product ID is required for Google platform",
          });
        }
        if (!data.purchaseToken) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["purchaseToken"],
            message: "Purchase Token is required for Google platform",
          });
        }
      }

      if (data.platform === SubscriptionPlatform.APPLE) {
        if (!data.receiptData) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["receiptData"],
            message: "Receipt data is required for Apple platform",
          });
        }
      }
    }),
});

export const SubscriptionValidation = { verifySubscriptionZodSchema };
