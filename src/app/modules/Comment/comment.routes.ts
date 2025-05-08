import express from 'express';
import { CommentController } from './comment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CommentValidation } from './comment.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(CommentValidation.createCommentZodSchema),
  CommentController.createComment
);

router.get('/', CommentController.getAllComments);

router.get('/:id', CommentController.getSingleComment);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(CommentValidation.updateCommentZodSchema),
  CommentController.updateComment
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  CommentController.deleteComment
);

export const CommentRoutes = router;
