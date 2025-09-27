import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.route';
import { ServiceRoutes } from '../modules/service/service.route';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/categories", route: CategoryRoutes },
    { path: "/services", route: ServiceRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;