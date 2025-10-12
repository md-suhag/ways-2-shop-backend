import { Model } from "mongoose";

export interface IPackage {
  title: string;
  description: string;
  price: number;
  durationInDays: number;
  googleProductId?: string;
  appleProductId?: string;
  features?: string[];
  isActive: boolean;
}

export type PackageModel = Model<IPackage, Record<string, unknown>>;
