import { Schema, model } from "mongoose";
import { IService, ServiceModel } from "./service.interface";

const serviceSchema = new Schema<IService, ServiceModel>({
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  ratePerHour: {
    type: Number,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

export const Service = model<IService, ServiceModel>("Service", serviceSchema);
