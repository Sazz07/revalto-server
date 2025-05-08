import express from 'express';
import { PaymentController } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/init',
  auth(UserRole.USER),
  validateRequest(PaymentValidation.initPaymentZodSchema),
  PaymentController.initPayment
);

router.get('/ipn', PaymentController.validatePayment);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PaymentController.getAllPayments
);

router.get(
  '/my-payments',
  auth(UserRole.USER),
  PaymentController.getUserPayments
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER),
  PaymentController.getSinglePayment
);

export const PaymentRoutes = router;
