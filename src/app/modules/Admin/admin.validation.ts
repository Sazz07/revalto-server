import { z } from 'zod';
import { EMAIL_REGEX, PHONE_REGEX } from '../../constants';
import { UserStatus } from '@prisma/client';

const createAdminZodSchema = z.object({
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters'),
  admin: z.object({
    firstName: z
      .string({
        required_error: 'First name is required',
      })
      .min(1, 'First name cannot be empty'),
    middleName: z.string().optional(),
    lastName: z
      .string({
        required_error: 'Last name is required',
      })
      .min(1, 'Last name cannot be empty'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format')
      .regex(EMAIL_REGEX, 'Invalid email format'),
    profilePhoto: z.string().optional(),
    contactNumber: z
      .string()
      .regex(PHONE_REGEX, 'Invalid phone number format')
      .optional(),
    address: z.string().optional(),
  }),
});

const updateUserStatusZodSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be ACTIVE, BLOCKED, or DELETED',
  }),
});

export const AdminValidation = {
  createAdminZodSchema,
  updateUserStatusZodSchema,
};
