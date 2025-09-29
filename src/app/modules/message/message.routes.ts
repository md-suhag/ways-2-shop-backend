import express from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { MessageController } from "./message.controller";
import validateRequest from "../../middlewares/validateRequest";
import { MessageValidations } from "./message.validation";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  validateRequest(MessageValidations.createMessageZodSchema),
  MessageController.createMessage
);
router.get(
  "/:id",
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  MessageController.getChatMessages
);

export const MessageRoutes = router;
