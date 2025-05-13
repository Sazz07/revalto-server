import express from 'express';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { createFileUploadMiddleware } from '../../middlewares/fileUploadMiddleware';

const router = express.Router();

router.post(
  '/create-user',
  createFileUploadMiddleware({
    fieldName: 'file',
    validationSchema: UserValidation.createUserZodSchema,
  }),
  UserController.createUser
);

router.get(
  '/profile/me',
  auth(UserRole.ADMIN, UserRole.USER),
  UserController.getMyProfile
);

router.patch(
  '/profile/update',
  auth(UserRole.ADMIN, UserRole.USER),
  createFileUploadMiddleware({
    fieldName: 'file',
    validationSchema: UserValidation.updateUserZodSchema,
  }),
  UserController.updateMyProfile
);

export const UserRoutes = router;
