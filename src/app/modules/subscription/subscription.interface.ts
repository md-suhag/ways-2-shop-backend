import { Model, Types } from "mongoose";

export interface IVerifySubscription {
  platform: SubscriptionPlatform;
  purchaseToken: string;
  receiptData: string;
  productId: string;
  userId: string;
}

export enum SubscriptionPlatform {
  GOOGLE = "google",
  APPLE = "apple",
}

export interface ISubscription {
  user: Types.ObjectId;
  package: Types.ObjectId;
  platform: SubscriptionPlatform;
  transactionId: string;
  purchaseToken?: string; // Google
  receiptData?: string; // Apple
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  priceAtPurchase: number;
  status: "pending" | "active" | "expired" | "cancelled";
}

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
