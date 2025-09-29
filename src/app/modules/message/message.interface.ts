import { Model, Types } from "mongoose";
import { MESSAGE_TYPE } from "./message.constants";

export interface IMessage {
  _id?: Types.ObjectId;
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  type: MESSAGE_TYPE;
  text?: string;
  seenBy?: Types.ObjectId[];
}

export type MessageModel = Model<IMessage>;
