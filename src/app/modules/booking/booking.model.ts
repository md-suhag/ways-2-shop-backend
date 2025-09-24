import { Schema, model } from 'mongoose';
import { IBooking, BookingModel } from './booking.interface'; 

const bookingSchema = new Schema<IBooking, BookingModel>({
  // Define schema fields here
});

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);
