import { Schema, model } from "mongoose";
import { IService, ServiceModel } from "./service.interface";

const serviceSchema = new Schema<IService, ServiceModel>(
  {
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
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ coordinates: "2dsphere" });

export const Service = model<IService, ServiceModel>("Service", serviceSchema);
