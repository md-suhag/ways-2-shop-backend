import { Chat } from "../chat/chat.model";
import { IMessage } from "./message.interface";
import { Message } from "./message.model";

const createMessage = async (payload: IMessage): Promise<IMessage> => {
  // check if the chat exists and the sender is a participant
  const isChatExist = await Chat.findOne({
    _id: payload.chat,
    participants: { $in: [payload.sender] },
  });
  if (!isChatExist) throw new Error("Chat not found");

  const result = await Message.create(payload);

  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chat}`, result);
  }

  return result;
};

const getMessageFromDB = async (id: any): Promise<IMessage[]> => {
  const messages = await Message.find({ chatId: id }).sort({ createdAt: -1 });
  return messages;
};

export const MessageService = { createMessage, getMessageFromDB };
