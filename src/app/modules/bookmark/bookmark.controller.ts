import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookmarkService } from "./bookmark.service";
import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const toggleBookmark = catchAsync(async (req: Request, res: Response) => {
  const result = await BookmarkService.toggleBookmark(
    req.user as JwtPayload,
    req.params.serviceId
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result,
  });
});

const getBookmark = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await BookmarkService.getBookmark(user as JwtPayload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Bookmark Retrieved Successfully",
    data: result,
  });
});

export const BookmarkController = { toggleBookmark, getBookmark };
