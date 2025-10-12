import { model, Schema } from "mongoose";
import { ISubscription, SubscriptionModel } from "./subscription.interface";

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    platform: { type: String, enum: ["google", "apple"], required: true },
    transactionId: { type: String, required: true, unique: true },
    purchaseToken: { type: String },
    receiptData: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = model<ISubscription, SubscriptionModel>(
  "Subscription",
  subscriptionSchema
);
