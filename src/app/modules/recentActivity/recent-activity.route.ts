import express from "express";
import { RecentActivityController } from "./recent-activity.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.get(
  "/",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  RecentActivityController.getRecentActivity
);

export const RecentActivityRoutes = router;
