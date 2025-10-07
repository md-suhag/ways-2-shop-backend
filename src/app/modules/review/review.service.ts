import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { JwtPayload } from "jsonwebtoken";

const createReviewToDB = async (
  payload: IReview,
  user: JwtPayload
): Promise<IReview> => {
  payload.customer = user.id;

  const customer = await User.findById(payload.customer);
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Customer Found");
  }

  const isExistReview = await Review.findOne({ booking: payload.booking });

  if (isExistReview) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Already Reviewed");
  }

  // checking the rating is valid or not;
  const rating = Number(payload.rating);
  if (rating < 1 || rating > 5) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid rating value");
  }

  const result = await Review.create(payload);

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed To create Review");
  }

  const provider = await User.findById(payload.provider);
  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No Provider Found");
  }

  // initialize stats if undefined
  provider.totalReview = provider.totalReview || 0;
  provider.avgRating = provider.avgRating || 0;

  // calculate new average incrementally
  const newTotalReview = provider.totalReview + 1;
  const newAvgRating =
    (provider.avgRating * provider.totalReview + rating) / newTotalReview;

  // update provider
  await User.findByIdAndUpdate(provider._id, {
    totalReview: newTotalReview,
    avgRating: newAvgRating,
  });

  return payload;
};

export const ReviewService = { createReviewToDB };
