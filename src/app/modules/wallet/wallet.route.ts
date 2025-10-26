import express from "express";
import { WalletController } from "./wallet.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { WalletValidation } from "./wallet.validation";

const router = express.Router();

router.get(
  "/balance",
  auth(USER_ROLES.PROVIDER),
  WalletController.getWalletBalance
);

router.post(
  "/withdraw",
  auth(USER_ROLES.PROVIDER),
  validateRequest(WalletValidation.withdrawZodSchema),
  WalletController.withdraw
);

export const WalletRoutes = router;
