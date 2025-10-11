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

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.users,
    pagination: result.pagination,
  });
});

export const AdminController = { contactUs, getAllUsers };
