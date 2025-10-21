import { Request, Response } from "express";
import stripe from "../config/stripe";
import config from "../config";
import Stripe from "stripe";
import { User } from "../app/modules/user/user.model";
import { Booking } from "../app/modules/booking/booking.model";
import { IPaymentStatus } from "../app/modules/booking/booking.interface";
import { sendNotifications } from "../helpers/notificationsHelper";
import { NOTIFICATION_TYPE } from "../app/modules/notification/notification.constants";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ error: "missing stripe signature header" });
  }
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret as string
    );
  } catch (err) {
    console.error(
      "⚠️ Webhook signature verification failed:",
      (err as Error).message
    );
    return res.sendStatus(400);
  }

  // Handle account updates
  if (event.type === "account.updated") {
    const account = event.data.object;
    const user = await User.findOne({ stripeAccountId: account.id });

    if (user) {
      user.isStripeAccountReady =
        account.details_submitted && account.charges_enabled;

      await user.save();
    }
  } else if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const booking = await Booking.findOne({ orderId });
    if (booking) {
      booking.paymentStatus = IPaymentStatus.PAID;

      await booking.save();
      await sendNotifications({
        title: "Payment Successful!",
        message: `Payment successful. Order Id: ${booking.orderId}`,
        type: NOTIFICATION_TYPE.PAYMENT,
        receiver: booking?.customer,
      });
    }
  }

  res.sendStatus(200);
};
