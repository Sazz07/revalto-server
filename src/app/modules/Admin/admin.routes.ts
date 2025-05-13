import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { createFileUploadMiddleware } from '../../middlewares/fileUploadMiddleware';

const router = express.Router();

router.post(
  '/create-admin',
  auth(UserRole.ADMIN),
  createFileUploadMiddleware({
    fieldName: 'file',
    validationSchema: AdminValidation.createAdminZodSchema,
  }),
  AdminController.createAdmin
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
