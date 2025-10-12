import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AnalyticsService } from "./analytics.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const getAnalyticsOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAnalyticsOverview();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Analytics overview fetched successfully",
    data: result,
  });
});

export const AnalyticsController = { getAnalyticsOverview };
