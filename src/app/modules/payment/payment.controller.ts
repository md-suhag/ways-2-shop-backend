import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service";

const handleCancel = catchAsync(async (req: Request, res: Response) => {
  await PaymentService.handleCancel(req.body.sessionId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment cancelled Successfully",
  });
});

export const PaymentController = {
  handleCancel,
};
