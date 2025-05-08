import express from 'express';
import { ReportController } from './report.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReportValidation } from './report.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.USER),
  validateRequest(ReportValidation.createReportZodSchema),
  ReportController.createReport
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ReportController.getAllReports
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ReportController.getSingleReport
);

router.patch(
  '/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(ReportValidation.updateReportZodSchema),
  ReportController.updateReportStatus
);

export const ReportRoutes = router;
