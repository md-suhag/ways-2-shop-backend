import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ReviewController } from "./review.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewValidation } from "./review.validation";
const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER),
  validateRequest(ReviewValidation.reviewZodSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
