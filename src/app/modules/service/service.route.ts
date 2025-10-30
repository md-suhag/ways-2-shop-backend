import express from "express";
import { ServiceController } from "./service.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ServiceValidations } from "./service.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.PROVIDER),
  fileUploadHandler(),
  validateRequest(ServiceValidations.createServiceZodSchema),
  ServiceController.createService
);
router.get(
  "/",
  auth(),
  validateRequest(ServiceValidations.getAllServiceZodSchema),
  ServiceController.getAllService
);
router.get("/me", auth(USER_ROLES.PROVIDER), ServiceController.getMyService);
router.patch(
  "/:id",
  auth(USER_ROLES.PROVIDER),
  fileUploadHandler(),
  validateRequest(ServiceValidations.updateServiceZodSchema),
  ServiceController.updateMyService
);
router.get("/:id", auth(), ServiceController.getSingleService);
router.get("/:id/reviews", ServiceController.getServiceReviews);
export const ServiceRoutes = router;
