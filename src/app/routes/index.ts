import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.route";
import { ServiceRoutes } from "../modules/service/service.route";
import { BookmarkRoutes } from "../modules/bookmark/bookmark.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/services", route: ServiceRoutes },
  { path: "/bookmarks", route: BookmarkRoutes },
  { path: "/reviews", route: ReviewRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
