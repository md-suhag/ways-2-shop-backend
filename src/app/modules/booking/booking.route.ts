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
router.get(
  "/provider",
  auth(USER_ROLES.PROVIDER),
  BookingController.getProviderBookings
);
router.get(
  "/provider/upcoming",
  auth(USER_ROLES.PROVIDER),
  BookingController.getUpcomingBookings
);
router.get(
  "/provider/completed",
  auth(USER_ROLES.PROVIDER),
  BookingController.getCompletedBookings
);

router.get("/:id", auth(), BookingController.getSingleBooking);
router.patch(
  "/:id",
  auth(USER_ROLES.CUSTOMER),
  validateRequest(BookingValidations.updateBookingStatusZodSchema),
  BookingController.updateBookingStatus
);

export const BookingRoutes = router;
