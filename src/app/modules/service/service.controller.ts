import { Request, Response } from "express";
import { ServiceService } from "./service.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createService = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req.files && "image" in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const { latitude, longitude, ...rest } = req.body;

  const data = {
    image,
    ...rest,
    coordinates: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    },
  };

  const result = await ServiceService.createServiceToDB(
    data,
    req.user as JwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Service created successfully",
    data: result,
  });
});

// const getAllService = catchAsync(async (req: Request, res: Response) => {
//   const result = await ServiceService.getAllServiceFromDB(req.body, req.query);

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: "All service retreived successfully",
//     data: result.services,
//     pagination: result.pagination,
//   });
// });

const getAllService = catchAsync(async (req: Request, res: Response) => {
  const { latitude, longitude, distance, category, page, limit } = req.query;

  const filterPayload = {
    coordinates:
      latitude && longitude ? [Number(longitude), Number(latitude)] : undefined,
    distance: distance ? Number(distance) : undefined,
    category,
  };

  const queryParams = { page, limit };

  const result = await ServiceService.getAllServiceFromDB(
    filterPayload,
    queryParams
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "All service retrieved successfully",
    data: result.services,
    pagination: result.pagination,
  });
});

export const ServiceController = { createService, getAllService };
