import { Schema, model } from "mongoose";
import {
  IRecentActivity,
  RecentActivityType,
} from "./recent-activity.interface";

const recentActivitySchema = new Schema<IRecentActivity>(
  {
    type: {
      type: String,
      enum: Object.values(RecentActivityType),
      required: true,
    },
    message: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export const RecentActivity = model<IRecentActivity>(
  "RecentActivity",
  recentActivitySchema
);
