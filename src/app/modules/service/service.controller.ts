import { Request, Response } from 'express';
import { ServiceServices } from './service.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';


const createService = catchAsync( async (req: Request, res: Response) => {

  let image;
    if (req.files && 'image' in req.files && req.files.image[0]) {
        image = `/images/${req.files.image[0].filename}`;
    }

    const data = {
        image,
        ...req.body,
    };

 const result = await ServiceServices.createServiceToDB(data,req.user as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Service created successfully',
        data: result
    });

})

export const ServiceController = {createService };
