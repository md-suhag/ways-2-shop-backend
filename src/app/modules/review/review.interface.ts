import { Model, Types } from "mongoose";

export interface IReview {
  customer: Types.ObjectId;
  provider: Types.ObjectId;
  service: Types.ObjectId;
  booking: Types.ObjectId;
  comment: string;
  rating: number;
}

export type ReviewModel = Model<IReview>;
