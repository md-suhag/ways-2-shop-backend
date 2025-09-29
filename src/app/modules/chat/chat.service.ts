import { JwtPayload } from "jsonwebtoken";

import { IChat } from "./chat.interface";
import { Chat } from "./chat.model";

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

export const ChatService = { createChatToDB };
