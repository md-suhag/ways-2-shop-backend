import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Wallet } from "./wallet.model";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { IWithdrawStatus, Withdraw } from "./withdraw.model";
import stripe from "../../../config/stripe";

const getWalletBalance = async (user: JwtPayload) => {
  const wallet = await Wallet.findOne({ provider: user.id });
  return wallet || { balance: 0, totalEarned: 0, totalWithdrawn: 0 };
};
const withdraw = async (user: JwtPayload, amount: number) => {
  const MIN_WITHDRAWAL = 10;
  if (amount < MIN_WITHDRAWAL) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Minimum withdrawal amount is $${MIN_WITHDRAWAL}`
    );
  }

  const wallet = await Wallet.findOne({ provider: user.id });
  if (!wallet || wallet.balance < amount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Insufficient balance. Available: $${wallet?.balance || 0}`
    );
  }

  const provider = await User.findById(user.id);
  if (!provider?.stripeAccountId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please connect your Stripe account first"
    );
  }

  // Create withdraw record
  const withdraw = await Withdraw.create({
    provider: user.id,
    amount: amount,
    status: IWithdrawStatus.PROCESSING,
  });

  try {
    // Transfer via Stripe
    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: "usd",
      destination: provider.stripeAccountId,
    });

    // Deduct from wallet
    await Wallet.deductBalance(user.id, amount);

    // Update withdraw
    withdraw.stripeTransferId = transfer.id;
    withdraw.status = IWithdrawStatus.COMPLETED;

    await withdraw.save();

    return withdraw;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    withdraw.status = IWithdrawStatus.FAILED;
    withdraw.failureReason = error.message;
    await withdraw.save();

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Withdrawal failed: ${error.message}`
    );
  }
};

export const WalletService = { getWalletBalance, withdraw };
