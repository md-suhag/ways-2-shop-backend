import { Model, Types } from 'mongoose';

export enum IBookingStatus  {
PENDING="PENDING",
COMPLETED = "COMPLETED"
}
export enum IPaymentStatus  {
PENDING="PENDING",
FAILED = "FAILED",
PAID = "PAID"
}
export enum IPaymentType  {
ONLINE="ONLINE",
COD = "COD"
}
export interface ILocation{
  locationName :string;
  coordinates:ICoordinates
}
 export interface ICoordinates {
    lat: number;
    lng: number;
}

export interface IBooking {
  service:Types.ObjectId;
  customer:Types.ObjectId;
  provider:Types.ObjectId;
  status:IBookingStatus;
  paymentStatus:IPaymentStatus;
  paymentType:IPaymentType;
  txId:string;
  bookingId:string;
  price:number;
  location:ILocation;
  images:string[],
  note:string;
  bookingDate:Date;
  startTime:Date;
  endTime:Date;
};

export type BookingModel = Model<IBooking>;
