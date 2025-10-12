import { model, Schema } from "mongoose";
import { BillingCycle, IPackage, PackageModel } from "./package.interface";

const packageSchema = new Schema<IPackage, PackageModel>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    durationInDays: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      required: true,
      default: BillingCycle.MONTHLY,
    },
    googleProductId: { type: String },
    appleProductId: { type: String },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Package = model<IPackage, PackageModel>("Package", packageSchema);
