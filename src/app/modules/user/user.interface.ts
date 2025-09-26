/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

interface IStripeAccountInfo {
    status: string;
    stripeAccountId: string;
    externalAccountId: string;
    currency: string;
}

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

export interface IUser {
    name: string;
    email: string;
    password?: string;
    role: USER_ROLES;
    contact?: string;
    location?: string;
    profile?: string;
    businessCategory?:string[];
    isVerified?: boolean;
    isActive:IsActive;
    isDeleted?:boolean;
    isOnline?:boolean;
    appId?:string;
    authentication?: IAuthenticationProps;
    accountInformation?: IStripeAccountInfo;
}

export type UserModal = {
    isExistUserById(id: string): any;
    isExistUserByEmail(email: string): any;
    isAccountCreated(id: string): any;
    isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;