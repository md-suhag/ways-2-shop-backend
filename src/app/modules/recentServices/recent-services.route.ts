import express from "express";
import { RecentServicesController } from "./recent-services.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RecentServicesValidations } from "./recent-services.validation";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER),
  validateRequest(RecentServicesValidations.createRecentServicesZodSchema),
  RecentServicesController.createRecentServices
);

// get user recent viewed services
router.get(
  "/",
  auth(USER_ROLES.CUSTOMER),
  RecentServicesController.getUserRecentServices
);

export const RecentServicesRoutes = router;
