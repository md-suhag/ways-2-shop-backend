import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post(
  "/cancel",

  PaymentController.handleCancel
);

export const PaymentRoutes = router;
