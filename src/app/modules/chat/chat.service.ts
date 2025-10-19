import { JwtPayload } from "jsonwebtoken";

import { IChat } from "./chat.interface";
import { Chat } from "./chat.model";
import { IMessage } from "../message/message.interface";
import { Message } from "../message/message.model";
import QueryBuilder from "../../builder/QueryBuilder";

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

const getChatsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const chatsQuery = new QueryBuilder(
    Chat.find({
      participants: { $in: [user.id] },
    })
      .populate({
        path: "participants",
        select: "name  profile isOnline",
        match: {
          _id: { $ne: user.id },
        },
      })
      .select("participants updatedAt")
      .sort("-updatedAt"),
    query
  ).paginate();

  const [chats, pagination] = await Promise.all([
    chatsQuery.modelQuery.lean(),
    chatsQuery.getPaginationInfo(),
  ]);

  const chatList = await Promise.all(
    chats?.map(async (chat) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chatData: any = chat;

      const lastMessage: IMessage | null = await Message.findOne({
        chat: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select("text -_id");

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
  return { chatList, pagination };
};
export const ChatService = { createChatToDB, getChatsFromDB };
