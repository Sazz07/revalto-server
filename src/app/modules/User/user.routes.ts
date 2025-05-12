import express, { NextFunction, Request, Response } from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

import { IAuthUser } from '../../interfaces/common';

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

router.get(
  '/profile/me',
  auth(UserRole.ADMIN, UserRole.USER),
  UserController.getMyProfile
);

router.patch(
  '/profile/update',
  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.upload.single('file'),
  (req: Request & { user?: IAuthUser }, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = UserValidation.updateUserZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    return UserController.updateMyProfile(req, res, next);
  }
);

export const UserRoutes = router;
