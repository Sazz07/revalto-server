import { z } from 'zod';
import { ReportStatus } from '@prisma/client';

const createReportZodSchema = z.object({
  reason: z.string({
    required_error: 'Reason is required',
  }),
  details: z.string().optional(),
  reviewId: z.string({
    required_error: 'Review ID is required',
  }),
});

const updateReportZodSchema = z.object({
  status: z.nativeEnum(ReportStatus, {
    invalid_type_error: 'Status must be a valid report status',
  }),
});

export const ReportValidation = {
  createReportZodSchema,
  updateReportZodSchema,
};