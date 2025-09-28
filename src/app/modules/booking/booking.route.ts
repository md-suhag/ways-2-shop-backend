import express from "express";
import { BookingController } from "./booking.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { BookingValidations } from "./booking.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER),
  fileUploadHandler(),
  validateRequest(BookingValidations.createBookingZodSchema),
  BookingController.createBooking
);

export const BookingRoutes = router;
