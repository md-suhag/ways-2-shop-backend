import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidations } from "./payment.validation";

const router = express.Router();

router.post(
  "/create-intent",
  auth(USER_ROLES.CUSTOMER),
  validateRequest(PaymentValidations.createIntentZodSchema),
  PaymentController.createPaymentIntent
);

export const PaymentRoutes = router;
