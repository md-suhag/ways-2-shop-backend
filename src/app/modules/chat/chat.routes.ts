import express from "express";
import auth from "../../middlewares/auth";
import { ChatController } from "./chat.controller";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { ChatValidations } from "./chat.validation";
const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  validateRequest(ChatValidations.createChatZodSchema),
  ChatController.createChat
);

router.get(
  "/",
  auth(USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER),
  ChatController.getMyChats
);

export const ChatRoutes = router;
