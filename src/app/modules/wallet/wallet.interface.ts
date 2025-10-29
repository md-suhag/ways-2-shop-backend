import { ClientSession, Model, Types } from "mongoose";

export interface IWallet {
  provider: Types.ObjectId;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

// Static methods for Wallet model
export interface WalletModel extends Model<IWallet> {
  addBalance(
    providerId: Types.ObjectId,
    amount: number,
    session: ClientSession
  ): Promise<IWallet>;

  deductBalance(providerId: Types.ObjectId, amount: number): Promise<IWallet>;
}
