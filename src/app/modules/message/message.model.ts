import { Schema, model } from "mongoose";
import { IMessage, MessageModel } from "./message.interface";
import { MESSAGE_TYPE } from "./message.constants";

const messageSchema = new Schema<IMessage, MessageModel>(
  {
    chat: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: Object.values(MESSAGE_TYPE),
      required: true,
    },
    text: {
      type: String,
    },

    seenBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage, MessageModel>("Message", messageSchema);
