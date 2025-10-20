import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { Chat } from "./chat.model";

import { Message } from "../message/message.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";

const createChatToDB = async (user: JwtPayload, otherParticipantId: string) => {
  const participants = [user.id, otherParticipantId];

  const anotherParticipant = await User.findById(otherParticipantId).select(
    "name profile"
  );

  const isExistChat = await Chat.findOne({
    participants: { $all: participants },
  }).lean();
  if (isExistChat) {
    return { ...isExistChat, anotherParticipant };
  }

  const result = await Chat.create({ participants });
  return { ...result, anotherParticipant };
};

const getChatsFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  const chatsQuery = new QueryBuilder(
    Chat.find({ participants: { $in: [user.id] } })
      .populate({
        path: "participants",
        select: "name profile isOnline",
        match: { _id: { $ne: user.id } },
      })
      .select("participants updatedAt")
      .sort("-updatedAt"),
    query
  ).paginate();

  const [chats, pagination] = await Promise.all([
    chatsQuery.modelQuery.lean(),
    chatsQuery.getPaginationInfo(),
  ]);

  if (!chats || chats.length === 0) return { chatList: [], pagination };

  // Ensure ids are ObjectId if your DB stores ObjectIds
  const chatIds = chats.map((c) =>
    typeof c._id === "string" ? new mongoose.Types.ObjectId(c._id) : c._id
  );

  const userId =
    typeof user.id === "string"
      ? new mongoose.Types.ObjectId(user.id)
      : user.id;

  const messagesData = await Message.aggregate([
    { $match: { chat: { $in: chatIds } } },
    // sort so the newest message per chat comes first
    { $sort: { chat: 1, createdAt: -1 } },
    {
      $group: {
        _id: "$chat",
        // first entry now is the newest message because of sort createdAt:-1
        lastMessage: {
          $first: {
            text: "$text",
          },
        },
        unreadCount: {
          $sum: {
            // if userId is in seenBy => 0, else => 1
            $cond: [{ $in: [userId, { $ifNull: ["$seenBy", []] }] }, 0, 1],
          },
        },
      },
    },
  ]);

  // map results for O(1) lookup
  const messageMap = new Map();
  messagesData.forEach((item) =>
    messageMap.set(item._id.toString(), {
      lastMessage: item.lastMessage,
      unreadCount: item.unreadCount,
    })
  );

  // build chat list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatList = chats.map((chat: any) => {
    const key = chat._id.toString();
    const msgInfo = messageMap.get(key);
    return {
      ...chat,
      participants: chat.participants,
      unreadCount: msgInfo?.unreadCount ?? 0,
      lastMessage: msgInfo?.lastMessage ?? null,
    };
  });

  return { chatList, pagination };
};

export const ChatService = { createChatToDB, getChatsFromDB };
