import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { createFileUploadMiddleware } from '../../middlewares/fileUploadMiddleware';

const router = express.Router();

// Public routes
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getSingleReview);

// User routes
router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.USER),
  createFileUploadMiddleware({
    fieldName: 'files',
    maxCount: 5,
    validationSchema: ReviewValidation.createReviewZodSchema,
  }),
  ReviewController.createReview
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  createFileUploadMiddleware({
    fieldName: 'files',
    maxCount: 5,
    validationSchema: ReviewValidation.updateReviewZodSchema,
  }),
  ReviewController.updateReview
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  ReviewController.deleteReview
);

// Save/unsave routes
router.post('/:id/save', auth(UserRole.USER), ReviewController.saveReview);

router.delete('/:id/save', auth(UserRole.USER), ReviewController.unsaveReview);

// Admin routes
router.patch(
  '/:id/moderate',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ReviewController.moderateReview
);

export const ReviewRoutes = router;
