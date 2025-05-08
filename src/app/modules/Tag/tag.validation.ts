import { z } from 'zod';

const createTagZodSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(1, 'Name cannot be empty'),
});

const updateTagZodSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  isDeleted: z.boolean().optional(),
});

export const TagValidation = {
  createTagZodSchema,
  updateTagZodSchema,
};
