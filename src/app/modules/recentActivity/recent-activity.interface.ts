import { Types } from "mongoose";

export enum RecentActivityType {
  CATEGORY_CREATED = "CATEGORY_CREATED",
  CATEGORY_UPDATED = "CATEGORY_UPDATED",
  PACKAGE_CREATED = "PACKAGE_CREATED",
  PACKAGE_UPDATED = "PACKAGE_UPDATED",
  TERMS_UPDATED = "TERMS_UPDATED",
  USER_ACTIVE = "USER_ACTIVE",
  USER_INACTIVE = "USER_INACTIVE",
}

export interface IRecentActivity {
  type: RecentActivityType;
  message: string;
  performedBy?: Types.ObjectId; // admin ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  createdAt: Date;
}
