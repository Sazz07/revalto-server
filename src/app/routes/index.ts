import express from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { AdminRoutes } from '../modules/Admin/admin.routes';
import { CategoryRoutes } from '../modules/Category/category.routes';
import { TagRoutes } from '../modules/Tag/tag.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/tag',
    route: TagRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
