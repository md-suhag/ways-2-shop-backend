import { Model } from "mongoose";

export enum CategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface ICategory {
  name: string;
  image: string;
  status: CategoryStatus;
  isDeleted?: boolean;
}

export type CategoryModel = Model<ICategory, Record<string, unknown>>;
