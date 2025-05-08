import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { AdminController } from './admin.controller';
import { fileUploader } from '../../../helpers/fileUploader';
import { AdminValidation } from './admin.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.post(
  '/create-admin',
  auth(UserRole.ADMIN),
  fileUploader.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = AdminValidation.createAdminZodSchema.parse(
      JSON.parse(req.body.data)
    );
    return AdminController.createAdmin(req, res, next);
  }
);

router.get('/', auth(UserRole.ADMIN), AdminController.getAllUsers);

router.get('/:id', auth(UserRole.ADMIN), AdminController.getSingleUser);

router.patch(
  '/:id/status',
  auth(UserRole.ADMIN),
  validateRequest(AdminValidation.updateUserStatusZodSchema),
  AdminController.updateUserStatus
);

router.delete('/:id', auth(UserRole.ADMIN), AdminController.deleteUser);

export const AdminRoutes = router;
