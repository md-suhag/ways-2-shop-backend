import { Request, Response } from "express";
import { AdminServices } from "./admin.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const contactUs = catchAsync(async (req: Request, res: Response) => {
  await AdminServices.contactUs(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Form data sent successfully",
  });
});

export const AdminController = { contactUs };
