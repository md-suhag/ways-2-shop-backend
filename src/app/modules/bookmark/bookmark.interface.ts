import { Model, Types } from "mongoose";

export interface IBookmark {
    user: Types.ObjectId,
    service: Types.ObjectId
}

export type BookmarkModel = Model<IBookmark>;