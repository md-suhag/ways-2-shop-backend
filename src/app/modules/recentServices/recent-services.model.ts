import { Schema, model } from "mongoose";
import {
  IRecentServices,
  RecentServicesModel,
} from "./recent-services.interface";

const RecentServicesSchema = new Schema<IRecentServices, RecentServicesModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  { timestamps: true }
);

export const RecentServices = model<IRecentServices, RecentServicesModel>(
  "RecentServices",
  RecentServicesSchema
);
