import { z } from 'zod';
import { EMAIL_REGEX, PHONE_REGEX } from '../../constants';

const loginZodSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z.string({
    required_error: 'Password is required',
  }),
});

const registerZodSchema = z.object({
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters'),
  user: z.object({
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

const changePasswordZodSchema = z.object({
  oldPassword: z.string({
    required_error: 'Old password is required',
  }),
  newPassword: z
    .string({
      required_error: 'New password is required',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters'),
});

export const AuthValidation = {
  loginZodSchema,
  changePasswordZodSchema,
  registerZodSchema,
};
