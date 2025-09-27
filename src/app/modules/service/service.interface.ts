import { Model, Types } from 'mongoose';

export interface IService {
  description:string;
  image:string; 
  ratePerHour:number;
  category:Types.ObjectId;
  provider:Types.ObjectId;
};

export type ServiceModel = Model<IService>;
