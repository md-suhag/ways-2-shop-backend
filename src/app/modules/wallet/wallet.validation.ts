import { z } from "zod";

const withdrawZodSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive("Amount must be positive"),
  }),
});

export const WalletValidation = { withdrawZodSchema };
