import { JwtPayload } from "jsonwebtoken";
import { IDisclaimer } from "./disclaimer.interface";
import { Disclaimer } from "./disclaimer.model";
import { RecentActivity } from "../recentActivity/recent-activity.model";
import { RecentActivityType } from "../recentActivity/recent-activity.interface";
import { User } from "../user/user.model";

// create or update disclaimer
const createUpdateDisclaimer = async (
  payload: IDisclaimer,
  user: JwtPayload
) => {
  const result = await Disclaimer.findOneAndUpdate(
    { type: payload.type },
    { $set: payload },
    { new: true, upsert: true }
  );
  const adminData = await User.findById(user.id).select("name");
  await RecentActivity.create({
    type: RecentActivityType.TERMS_UPDATED,
    performedBy: user.id,
    message: `${adminData?.name} : Updated ${payload.type}`,
  });

  return result;
};

// get all disclaimer
const getAllDisclaimer = async (type: string) => {
  const result = await Disclaimer.findOne({ type });
  return result;
};

export const DisclaimerServices = { createUpdateDisclaimer, getAllDisclaimer };
