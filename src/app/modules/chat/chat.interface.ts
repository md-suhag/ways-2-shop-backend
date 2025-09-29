import { Model, Types } from "mongoose";

export interface IChat {
  _id?: string;
  participants: Types.ObjectId[];
}

export type ChatModel = Model<IChat>;
