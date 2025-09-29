import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ChatService } from "./chat.service";
import { JwtPayload } from "jsonwebtoken";

const createChat = catchAsync(async (req: Request, res: Response) => {
  const chat = await ChatService.createChatToDB(
    req.user as JwtPayload,
    req.body.otherParticipantId
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Create Chat Successfully",
    data: chat,
  });
});

export const ChatController = {
  createChat,
};
