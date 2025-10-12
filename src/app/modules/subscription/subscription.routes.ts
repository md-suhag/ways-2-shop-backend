import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionValidation } from "./subscription.validation";
const router = express.Router();

router.post(
  "/verify",
  validateRequest(SubscriptionValidation.verifySubscriptionZodSchema),
  SubscriptionController.verifySubscriptions
);

export const SubscriptionRoutes = router;
