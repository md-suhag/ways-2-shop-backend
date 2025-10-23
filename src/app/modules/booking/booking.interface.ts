import { Model, Types } from "mongoose";

export enum IBookingStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
export enum IPaymentStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  TRANSFERRED = "TRANSFERRED",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}
export enum IPaymentType {
  ONLINE = "ONLINE",
  COD = "COD",
}
export interface ILocation {
  locationName: string;
  coordinates: ICoordinates;
}
export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IBooking {
  service: Types.ObjectId;
  customer: Types.ObjectId;
  provider: Types.ObjectId;
  status: IBookingStatus;
  paymentStatus: IPaymentStatus;
  paymentType: IPaymentType;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  transactionId?: string;
  orderId: string;
  price: number;
  location: ILocation;
  images?: string[];
  notes?: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
}

export type BookingModel = Model<IBooking>;
