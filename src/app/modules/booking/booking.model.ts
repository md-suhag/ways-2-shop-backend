import { Schema, model } from "mongoose";
import {
  IBooking,
  BookingModel,
  IBookingStatus,
  IPaymentStatus,
  IPaymentType,
  ILocation,
  ICoordinates,
} from "./booking.interface";

const CoordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false } // don’t create extra _id for subdoc
);

const LocationSchema = new Schema<ILocation>(
  {
    locationName: { type: String, required: true },
    coordinates: { type: CoordinatesSchema, required: true },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(IBookingStatus),
      default: IBookingStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(IPaymentStatus),
      default: IPaymentStatus.PENDING,
    },
    paymentType: {
      type: String,
      enum: Object.values(IPaymentType),
      required: true,
    },
    txId: { type: String, default: null },
    orderId: { type: String, unique: true },
    price: { type: Number, required: true },
    location: { type: LocationSchema, required: true },
    images: [{ type: String }],
    notes: { type: String, default: "" },
    bookingDate: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Booking = model<IBooking, BookingModel>("Booking", bookingSchema);
