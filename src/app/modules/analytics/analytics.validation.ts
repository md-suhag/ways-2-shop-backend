import { z } from "zod";

const analyticsOverviewZodSchema = z.object({
  query: z.object({
    range: z.enum(["today", "7d", "30d", "all"]).optional().default("7d"),
  }),
});

export const AnalyticsValidations = {
  analyticsOverviewZodSchema,
};
