import { Model, Types } from "mongoose";

export interface IReview {
    customer: Types.ObjectId;
    barber: Types.ObjectId;
    service: Types.ObjectId;
    comment: string;
    rating: number;
}

export type ReviewModel = Model<IReview>;