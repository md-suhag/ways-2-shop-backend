import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Booking } from "../booking/booking.model";
import stripe from "../../../config/stripe";

const createPaymentIntent = async (bookingId: string) => {
  const booking = await Booking.findOne({ _id: bookingId });
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.price * 100,
    currency: "usd",
    metadata: {
      bookingId: booking._id.toString(),
      customerId: booking.customer.toString(),
    },
  });

  booking.txId = paymentIntent.id;
  await booking.save();

  return {
    clientSecret: paymentIntent.client_secret,
    bookingId: booking._id,
  };
};

export const PaymentService = {
  createPaymentIntent,
};
