import { Model, Types } from 'mongoose';

export interface IResetToken {
    user: Types.ObjectId;
    token: string;
    expireAt: Date;
}

export type ResetTokenModel = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isExistToken(token: string): any;
    isExpireToken(token: string): boolean;
} & Model<IResetToken>;
