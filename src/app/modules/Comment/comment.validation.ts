import { z } from 'zod';

const createCommentZodSchema = z.object({
  content: z.string({
    required_error: 'Comment content is required',
  }),
  reviewId: z.string({
    required_error: 'Review ID is required',
  }),
  parentId: z.string().optional(),
});

const updateCommentZodSchema = z.object({
  content: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const CommentValidation = {
  createCommentZodSchema,
  updateCommentZodSchema,
};
