import { Model } from "mongoose";

export enum BillingCycle {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}
export interface IPackage {
  title: string;
  description?: string;
  price: number;
  durationInDays: number;
  billingCycle: BillingCycle;
  googleProductId?: string;
  appleProductId?: string;
  features?: string[];
  isActive: boolean;
}

export type PackageModel = Model<IPackage, Record<string, unknown>>;
