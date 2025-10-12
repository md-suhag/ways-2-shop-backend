import express from "express";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post(
  "/contact",
  auth(),
  validateRequest(AdminValidations.contactUsZodSchema),
  AdminController.contactUs
);

router.get(
  "/users",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminController.getAllUsers
);
router.patch(
  "/users/:id/status",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(AdminValidations.updateUserStatusZodSchema),
  AdminController.updateUserStatus
);
router.get("/categories", AdminController.getAllCategories);

router.get(
  "/packages",
  auth(USER_ROLES.SUPER_ADMIN),
  AdminController.getAllPackages
);

export const AdminRoutes = router;
