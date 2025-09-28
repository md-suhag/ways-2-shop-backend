import express from "express";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidations } from "./admin.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/contact",
  auth(),
  validateRequest(AdminValidations.contactUsZodSchema),
  AdminController.contactUs
);

export const AdminRoutes = router;
