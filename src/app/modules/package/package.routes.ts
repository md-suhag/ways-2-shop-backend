import express from "express";
import { PackageController } from "./package.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PackageValidation } from "./package.validation";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  validateRequest(PackageValidation.createPackageZodSchema),
  PackageController.createPackage
);

export const PackageRoutes = router;
