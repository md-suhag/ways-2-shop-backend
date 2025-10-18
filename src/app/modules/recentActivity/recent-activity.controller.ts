import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { RecentActivityService } from "./recent-activity.service";

const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  const result = await RecentActivityService.getRecentActivityFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Recent Activity retrieved successfully",
    data: result.data,
    pagination: result.pagination,
  });
});

export const RecentActivityController = {
  getRecentActivity,
};
