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
router.get(
  "/customer",
  auth(USER_ROLES.CUSTOMER),
  BookingController.getCustomerBookings
);

router.get("/:id", auth(), BookingController.getSingleBooking);
router.patch(
  "/:id",
  auth(USER_ROLES.CUSTOMER),
  validateRequest(BookingValidations.updateBookingStatusZodSchema),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
