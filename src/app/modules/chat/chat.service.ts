import { JwtPayload } from "jsonwebtoken";

import { IChat } from "./chat.interface";
import { Chat } from "./chat.model";
import { IMessage } from "../message/message.interface";
import { Message } from "../message/message.model";

const createChatToDB = async (
  user: JwtPayload,
  otherParticipantId: string
): Promise<IChat> => {
  const participants = [user.id, otherParticipantId];

  const isExistChat = await Chat.findOne({
    participants: { $all: participants },
  });
  if (isExistChat) {
    return isExistChat;
  }

  const result = await Chat.create({ participants });
  return result;
};

const getChatsFromDB = async (user: JwtPayload) => {
  const chats = await Chat.find({
    participants: { $in: [user.id] },
  })
    .populate({
      path: "participants",
      select: "name email profile isOnline",
      match: {
        _id: { $ne: user.id },
      },
    })
    .select("participants updatedAt")
    .sort("-updatedAt");

  const chatList: IChat[] = await Promise.all(
    chats?.map(async (chat) => {
      const chatData = chat?.toObject();

      const lastMessage: IMessage | null = await Message.findOne({
        chat: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select("text  type sender")
        .populate("sender", "name  profile");

      // find unread messages count
      const unreadCount = await Message.countDocuments({
        chat: chat?._id,
        seenBy: { $nin: [user.id] },
      });

      return {
        ...chatData,
        participants: chatData.participants,
        unreadCount: unreadCount || 0,
        lastMessage: lastMessage || null,
      };
    })
  );
  return chatList;
};
export const ChatService = { createChatToDB, getChatsFromDB };
