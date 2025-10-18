import express from "express";
import { AnalyticsController } from "./analytics.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { AnalyticsValidations } from "./analytics.validation";
const router = express.Router();

router.get(
  "/overview",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(AnalyticsValidations.analyticsOverviewZodSchema),
  AnalyticsController.getAnalyticsOverview
);
router.get(
  "/total-revenue",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getTotalRevenue
);

router.get(
  "/monthly-revenue-users",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getMonthlyRevenueUsers
);

export const AnalyticsRoutes = router;
