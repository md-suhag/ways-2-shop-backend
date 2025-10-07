import { Request, Response, NextFunction } from "express";
import { RecentCompaniesServices } from "./recent-services.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

// create recent sercvices
const createRecentServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const result = await RecentCompaniesServices.createRecentServices({
      ...req.body,
      user: user.id,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Recent companies created successfully!",
      data: result,
    });
  }
);

// get user recent services
const getUserRecentServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const result = await RecentCompaniesServices.getUserRecentServices(user.id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User recent companies retrieved successfully!",
      data: result,
    });
  }
);

export const RecentServicesController = {
  createRecentServices,
  getUserRecentServices,
};
