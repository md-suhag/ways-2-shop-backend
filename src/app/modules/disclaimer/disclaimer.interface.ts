import { Model, Types } from 'mongoose';
import { DisclaimerTypes } from './disclaimer.constants';

export type IDisclaimer = {
  _id?: Types.ObjectId;
  type: DisclaimerTypes;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DisclaimerModel = Model<IDisclaimer>;
