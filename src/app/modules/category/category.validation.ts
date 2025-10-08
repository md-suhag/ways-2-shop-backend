import { z } from "zod";
import { CategoryStatus } from "./category.interface";

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required" }),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    status: z.nativeEnum(CategoryStatus).optional(),
  }),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
