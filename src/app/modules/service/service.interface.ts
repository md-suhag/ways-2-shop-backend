import { Model, Types } from "mongoose";

interface ICoordinates {
  type: "Point";
  coordinates: [number, number];
}

export interface IService {
  description: string;
  image: string;
  ratePerHour: number;
  locationName: string;
  coordinates: ICoordinates;
  categories: Types.ObjectId[];
  provider: Types.ObjectId;
  isActive: boolean;
}

export type ServiceModel = Model<IService>;
