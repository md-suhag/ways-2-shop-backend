import { Model } from 'mongoose';

export interface ICategory {
  name: string;
  image: string;
}

export type CategoryModel = Model<ICategory, Record<string, unknown>>