import { Model } from 'mongoose';

export interface IFaq {
    question: string;
    answer: string;
}
export type FaqModel = Model<IFaq>;