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
  locationName: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
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

serviceSchema.index({ coordinates: "2dsphere" });

export const Service = model<IService, ServiceModel>("Service", serviceSchema);
