import express from "express";
import { PackageController } from "./package.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PackageValidation } from "./package.validation";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(PackageValidation.createPackageZodSchema),
  PackageController.createPackage
);

router.get("/", PackageController.getAllActivePackages);

router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(PackageValidation.updatePackageZodSchema),
  PackageController.updatePackage
);
export const PackageRoutes = router;
