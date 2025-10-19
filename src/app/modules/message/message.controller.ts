import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { MessageService } from "./message.service";
import { JwtPayload } from "jsonwebtoken";

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const payload = {
    ...req.body,
    sender: user.id,
  };

  const message = await MessageService.createMessage(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Message Created Successfully",
    data: message,
  });
});

const getChatMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getChatMessages(
    req.params.id,
    req.query,
    req.user as JwtPayload
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Message Retrieve Successfully",
    data: result.messages,
    pagination: result.pagination,
  });
});

export const MessageController = { createMessage, getChatMessages };
