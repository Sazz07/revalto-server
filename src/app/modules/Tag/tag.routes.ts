import express from 'express';
import { TagController } from './tag.controller';
import validateRequest from '../../middlewares/validateRequest';
import { TagValidation } from './tag.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(TagValidation.createTagZodSchema),
  TagController.createTag
);

router.get('/', TagController.getAllTags);

router.get('/:id', TagController.getSingleTag);

router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(TagValidation.updateTagZodSchema),
  TagController.updateTag
);

router.delete('/:id', auth(UserRole.ADMIN), TagController.deleteTag);

export const TagRoutes = router;
