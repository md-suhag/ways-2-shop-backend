import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IService } from './service.interface';
import { Service } from './service.model';
import { JwtPayload } from 'jsonwebtoken';


const createServiceToDB = async (payload:Partial<IService>,user:JwtPayload)=>{

    if(!payload.image){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Service image is required")
    }
    payload.provider = user.id
    await Service.create(payload)

}



export const ServiceServices = {
createServiceToDB

 };
