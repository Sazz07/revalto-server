import express from 'express';
import { CategoryController } from './Category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './Category.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
);

router.get('/', CategoryController.getAllCategories);

router.get('/:id', CategoryController.getSingleCategory);

router.patch(
  '/:id',
  auth(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory
);

router.delete('/:id', auth(UserRole.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
