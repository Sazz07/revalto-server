import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

const initPaymentZodSchema = z.object({
  reviewId: z.string({
    required_error: 'Review ID is required',
  }),
});

const updatePaymentZodSchema = z.object({
  status: z
    .nativeEnum(PaymentStatus, {
      invalid_type_error: 'Status must be a valid payment status',
    })
    .optional(),
});

export const PaymentValidation = {
  initPaymentZodSchema,
  updatePaymentZodSchema,
};
