import { JwtPayload } from "jsonwebtoken";
import { Chat } from "../chat/chat.model";
import { IMessage } from "./message.interface";
import { Message } from "./message.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";

const createMessage = async (payload: IMessage): Promise<IMessage> => {
  // check if the chat exists and the sender is a participant
  const isChatExist = await Chat.findOne({
    _id: payload.chat,
    participants: { $in: [payload.sender] },
  }).lean();
  if (!isChatExist) throw new Error("Chat not found");

  // get another participant
  const anotherParticipant = isChatExist.participants.filter(
    (participant) => participant.toString() !== payload.sender.toString()
  )[0];

  const result = await Message.create(payload);

  // const messageWithProfile = await Message.findById(result._id)
  //   .populate("sender", "profile")
  //   .lean();

  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chat}`, result);
  }
  // emit socket event for chats
  if (io) {
    io.emit(`getChatList::${anotherParticipant}`, result);
  }
  await Chat.findByIdAndUpdate(payload.chat, {});
  return result;
};

const getChatMessages = async (
  chatId: string,
  query: Record<string, unknown>,
  user: JwtPayload
) => {
  // check if the chat exists
  const existingChat = await Chat.findById(chatId);
  if (!existingChat)
    throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");

  // get another participant
  const anotherParticipant = existingChat.participants.filter(
    (participant) => participant.toString() !== user?.id
  )[0];

  // update seen status those are not seen by the user
  await Message.updateMany(
    { chat: chatId, seenBy: { $nin: [user?.id] } },
    { $addToSet: { seenBy: user?.id } }
  );

  // get messages
  const messageQuery = new QueryBuilder(
    Message.find({ chat: chatId })
      .select(" -updatedAt -__v")
      .populate("sender", "profile")
      .sort({ createdAt: -1 })
      .lean(),
    query
  )
    .paginate()
    .search(["text"])
    .filter();

  const [messages, pagination] = await Promise.all([
    messageQuery.modelQuery.lean(),
    messageQuery.getPaginationInfo(),
  ]);

  // add seen status to messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesWithStatus = messages.map((message: any) => {
    return {
      ...message,
      isSeen: message.seenBy
        .map((id: string) => id.toString())
        .includes(anotherParticipant.toString()),
    };
  });

  return { messages: messagesWithStatus, pagination };
};

export const MessageService = { createMessage, getChatMessages };
