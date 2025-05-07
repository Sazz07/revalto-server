import { z } from 'zod';

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
};
