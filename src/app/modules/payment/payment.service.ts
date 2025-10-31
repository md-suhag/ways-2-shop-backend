import stripe from "../../../config/stripe";
import { Booking } from "../booking/booking.model";

const handleCancel = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await Booking.findOneAndDelete({ orderId: session?.metadata?.orderId });
};

export const PaymentService = { handleCancel };
