import express, { NextFunction, Request, Response } from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { fileUploader } from '../../../helpers/fileUploader';
import { IAuthUser } from '../../interfaces/common';

const router = express.Router();

// Public routes
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getSingleReview);

// User routes
router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.upload.array('files', 5),
  (req: Request & { user?: IAuthUser }, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = ReviewValidation.createReviewZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    return ReviewController.createReview(req, res, next);
  }
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.upload.array('files', 5),
  (req: Request & { user?: IAuthUser }, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = ReviewValidation.updateReviewZodSchema.parse(
        JSON.parse(req.body.data)
      );
    }
    return ReviewController.updateReview(req, res, next);
  }
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
