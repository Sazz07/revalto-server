import { z } from 'zod';

const createCategoryZodSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(1, 'Name cannot be empty'),
  icon: z.string().optional(),
});

const updateCategoryZodSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  icon: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};
