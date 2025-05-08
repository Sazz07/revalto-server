import express from 'express';
import { VoteController } from './vote.controller';
import validateRequest from '../../middlewares/validateRequest';
import { VoteValidation } from './vote.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(VoteValidation.createVoteZodSchema),
  VoteController.createVote
);

router.get('/', auth(UserRole.ADMIN), VoteController.getAllVotes);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  VoteController.getSingleVote
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(VoteValidation.updateVoteZodSchema),
  VoteController.updateVote
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  VoteController.deleteVote
);

export const VoteRoutes = router;
