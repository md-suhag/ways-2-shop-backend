import { Model, Types } from "mongoose";

export interface IRecentServices {
  _id?: string;
  user: Types.ObjectId;
  service: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RecentServicesModel = Model<IRecentServices>;
