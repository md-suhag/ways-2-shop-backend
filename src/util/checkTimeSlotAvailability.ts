import { Booking } from "../app/modules/booking/booking.model";
import { IBookingStatus } from "../app/modules/booking/booking.interface";
import { Types } from "mongoose";

export const checkTimeSlotAvailability = async (
  providerId: Types.ObjectId,
  bookingDate: Date | string,
  startTime: Date | string,
  endTime: Date | string
): Promise<boolean> => {
  const date = new Date(bookingDate);

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {
    provider: providerId,
    bookingDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: [IBookingStatus.PENDING, IBookingStatus.COMPLETED] },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  const overlapExists = await Booking.exists(filter);
  return !overlapExists;
};
