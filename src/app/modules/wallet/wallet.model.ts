import { Schema, model, Types, ClientSession } from "mongoose";
import { IWallet, WalletModel } from "./wallet.interface";

const walletSchema = new Schema<IWallet, WalletModel>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add balance to wallet
walletSchema.statics.addBalance = async function (
  providerId: Types.ObjectId,
  amount: number,
  session: ClientSession
) {
  return await this.findOneAndUpdate(
    { provider: providerId },
    {
      $inc: {
        balance: amount,
        totalEarned: amount,
      },
    },
    { new: true, upsert: true, session }
  );
};

// Deduct balance from wallet
walletSchema.statics.deductBalance = async function (
  providerId: Types.ObjectId,
  amount: number
) {
  const wallet = await this.findOne({ provider: providerId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    throw new Error(`Insufficient balance. Available: $${wallet.balance}`);
  }

  wallet.balance -= amount;
  wallet.totalWithdrawn += amount;
  await wallet.save();

  return wallet;
};

export const Wallet = model<IWallet, WalletModel>("Wallet", walletSchema);
