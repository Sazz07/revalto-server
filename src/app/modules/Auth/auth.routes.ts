import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { fileUploader } from '../../../helpers/fileUploader';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);

router.post(
  '/register',
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.registerUser
);

router.post('/refresh-token', AuthController.refreshToken);

router.post(
  '/change-password',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword
);

export const AuthRoutes = router;
