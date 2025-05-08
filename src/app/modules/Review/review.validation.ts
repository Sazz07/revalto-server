import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

const createReviewZodSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  }),
  description: z.string({
    required_error: 'Description is required',
  }),
  rating: z
    .number({
      required_error: 'Rating is required',
    })
    .min(1)
    .max(5),
  purchaseSource: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string({
    required_error: 'Category ID is required',
  }),
  isPremium: z.boolean().optional(),
  premiumPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const updateReviewZodSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  purchaseSource: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  status: z.nativeEnum(ReviewStatus).optional(),
  isPremium: z.boolean().optional(),
  premiumPrice: z.number().optional(),
  isFeatured: z.boolean().optional(),
  moderationReason: z.string().optional(),
  isDeleted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
