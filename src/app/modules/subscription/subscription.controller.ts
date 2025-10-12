import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const verifySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.verifySubscriptions(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Purchase verified Successfully",
    data: result,
  });
});

export const SubscriptionController = {
  verifySubscriptions,
};
