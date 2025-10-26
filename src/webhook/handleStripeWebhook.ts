import { Request, Response } from "express";
import stripe from "../config/stripe";
import config from "../config";
import Stripe from "stripe";
import { User } from "../app/modules/user/user.model";
import { Booking } from "../app/modules/booking/booking.model";
import { IPaymentStatus } from "../app/modules/booking/booking.interface";
import { sendNotifications } from "../helpers/notificationsHelper";
import { NOTIFICATION_TYPE } from "../app/modules/notification/notification.constants";
import { Service } from "../app/modules/service/service.model";

const handleAccountUpdated = async (account: Stripe.Account) => {
  const user = await User.findOne({ stripeAccountId: account.id });
  if (!user) {
    console.warn(`No user found for Stripe account: ${account.id}`);
    return;
  }

  const isReady = account.details_submitted && account.charges_enabled;
  user.isStripeAccountReady = isReady;
  await user.save();

  if (isReady) {
    await Service.updateOne(
      { provider: user._id },
      { $set: { isActive: true } }
    );
  }
};

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const booking = await Booking.findOne({ orderId });
  if (!booking) return;

  const paymentIntentId = session.payment_intent as string;

  await Booking.updateOne(
    { orderId },
    {
      paymentStatus: IPaymentStatus.PAID,
      stripePaymentIntentId: paymentIntentId,
      transactionId: session.id,
    },
    { runValidators: true, upsert: true }
  );

  // Notify customer
  await sendNotifications({
    title: "Payment Successful!",
    message: `Payment successful. Order Id: ${booking.orderId}`,
    type: NOTIFICATION_TYPE.PAYMENT,
    receiver: booking.customer,
  });

  // Notify admin
  const admin = await User.findOne({ email: config.super_admin.email })
    .select("_id")
    .lean();

  if (admin) {
    await sendNotifications({
      type: NOTIFICATION_TYPE.BOOKING,
      title: "New booking created",
      message: "A new booking has been created successfully.",
      receiver: admin._id,
    });
  }
};

const handleChargeUpdated = async (charge: Stripe.Charge) => {
  console.log("💰 Charge updated:", charge.id);

  if (!charge.payment_intent) return;
  const paymentIntentId = charge.payment_intent as string;

  const booking = await Booking.findOne({
    stripePaymentIntentId: paymentIntentId,
  });
  if (!booking) return console.log("Booking not found for charge:", charge.id);

  if (!charge.balance_transaction) {
    console.log("Charge has no balance_transaction yet");
    return;
  }

  // Retrieve finalized fee/net info
  const balanceTx = await stripe.balanceTransactions.retrieve(
    charge.balance_transaction as string
  );

  const stripeFee = balanceTx.fee / 100;
  const netPrice = balanceTx.net / 100;

  booking.stripeFee = stripeFee;
  booking.netPrice = netPrice;
  await booking.save();

  console.log(
    ` Booking ${booking._id} updated with Stripe fee ${stripeFee} and net ${netPrice}`
  );
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("Missing Stripe signature header");
    return res.status(400).json({ error: "Missing stripe signature header" });
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret as string
    );
  } catch (err) {
    console.error(
      "Webhook signature verification failed:",
      (err as Error).message
    );
    return res.sendStatus(400);
  }

  try {
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "charge.updated":
        await handleChargeUpdated(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error("Error handling Stripe event:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error while processing Stripe webhook",
      error: (error as Error).message,
    });
  }
};
