import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PackageService } from "./package.service";
import { Request, Response } from "express";

const createPackage = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.createPackage(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Package created Successfully",
    data: result,
  });
});

const getAllActivePackages = catchAsync(async (req: Request, res: Response) => {
  const result = await PackageService.getAllActivePackagesFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All Packages retrieved Successfully",
    data: result,
  });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PackageService.updatePackageToDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Package updated Successfully",
    data: result,
  });
});

export const PackageController = {
  createPackage,
  getAllActivePackages,
  updatePackage,
};
