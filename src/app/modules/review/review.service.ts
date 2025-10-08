import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

const createReviewToDB = async (
  payload: IReview,
  user: JwtPayload
): Promise<IReview> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await User.findById(user.id).session(session);
    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "No Customer Found");
    }

    const isExistReview = await Review.findOne({
      booking: payload.booking,
    }).session(session);
    if (isExistReview) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Already Reviewed");
    }

    const rating = Number(payload.rating);
    if (rating < 1 || rating > 5) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid rating value");
    }

    const result = await Review.create([{ ...payload, customer: user.id }], {
      session,
    });
    const review = result[0];

    const provider = await User.findById(payload.provider).session(session);
    if (!provider) {
      throw new ApiError(StatusCodes.NOT_FOUND, "No Provider Found");
    }

    const newTotalReview = (provider.totalReview || 0) + 1;
    const newAvgRating =
      ((provider.avgRating || 0) * (provider.totalReview || 0) + rating) /
      newTotalReview;

    provider.totalReview = newTotalReview;
    provider.avgRating = newAvgRating;
    await provider.save({ session });

    await session.commitTransaction();
    session.endSession();

    return review;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const ReviewService = { createReviewToDB };
