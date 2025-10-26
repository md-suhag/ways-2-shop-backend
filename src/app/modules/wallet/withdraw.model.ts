import { Schema, Types, model } from "mongoose";

export enum IWithdrawStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IWithdraw {
  provider: Types.ObjectId;
  amount: number;
  stripeTransferId?: string;
  status: IWithdrawStatus;
  failureReason?: string;
}

const withdrawSchema = new Schema<IWithdraw>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeTransferId: { type: String },
    status: {
      type: String,
      enum: Object.values(IWithdrawStatus),
      default: IWithdrawStatus.PROCESSING,
    },
    failureReason: { type: String },
  },
  { timestamps: true }
);

export const Withdraw = model<IWithdraw>("Withdraw", withdrawSchema);
