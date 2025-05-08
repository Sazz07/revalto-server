import { z } from 'zod';
import { VoteType } from '@prisma/client';

const createVoteZodSchema = z.object({
  type: z.nativeEnum(VoteType, {
    required_error: 'Vote type is required',
    invalid_type_error: 'Vote type must be UPVOTE or DOWNVOTE',
  }),
  reviewId: z.string({
    required_error: 'Review ID is required',
  }),
});

const updateVoteZodSchema = z.object({
  type: z
    .nativeEnum(VoteType, {
      invalid_type_error: 'Vote type must be UPVOTE or DOWNVOTE',
    })
    .optional(),
  isDeleted: z.boolean().optional(),
});

export const VoteValidation = {
  createVoteZodSchema,
  updateVoteZodSchema,
};
