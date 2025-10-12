/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, Types } from "mongoose";
import { USER_ROLES } from "../../../enums/user";

interface IAuthenticationProps {
  isResetPassword: boolean;
  oneTimeCode: number;
  expireAt: Date;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface ILocation {
  locationName: string;
  coordinates: ICoordinates;
}
export interface ICoordinates {
  lat: number;
  lng: number;
}
export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: USER_ROLES;
  contact?: string;
  location?: ILocation;
  profile?: string;
  businessCategory?: Types.ObjectId[];
  totalJobs: number;
  avgRating: number;
  totalReview: number;
  isVerified?: boolean;
  isActive: IsActive;
  isDeleted?: boolean;
  isOnline?: boolean;
  appId?: string;
  authentication?: IAuthenticationProps;
}

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
