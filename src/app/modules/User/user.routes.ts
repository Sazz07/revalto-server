import express, { NextFunction, Request, Response } from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/create-user',
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createUserZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createUser(req, res, next);
  }
);

router.post(
  '/create-admin',
  auth(UserRole.ADMIN),
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createAdmin(req, res, next);
  }
);

router.get('/', auth(UserRole.ADMIN), UserController.getAllUsers);

router.get('/:id', auth(UserRole.ADMIN), UserController.getSingleUser);

router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateUser
);

router.patch(
  '/:id/status',
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateUserStatusZodSchema),
  UserController.updateUserStatus
);

router.delete('/:id', auth(UserRole.ADMIN), UserController.deleteUser);

router.get(
  '/profile/me',
  auth(UserRole.ADMIN, UserRole.USER),
  UserController.getMyProfile
);

router.patch(
  '/profile/update',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateMyProfile
);

export const UserRoutes = router;
