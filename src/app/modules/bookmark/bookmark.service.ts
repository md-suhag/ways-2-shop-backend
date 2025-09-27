import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IBookmark } from "./bookmark.interface";
import { Bookmark } from "./bookmark.model";
import { JwtPayload } from "jsonwebtoken";

const toggleBookmark = async (
  user: JwtPayload,
  serviceId: string
): Promise<string> => {
  // Check if the bookmark already exists
  const existingBookmark = await Bookmark.findOne({
    user: user.id,
    service: serviceId,
  });

  if (existingBookmark) {
    // If the bookmark exists, delete it
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    return "Bookmark Remove successfully";
  } else {
    // If the bookmark doesn't exist, create it
    const result = await Bookmark.create({
      user: user.id,
      service: serviceId,
    });
    if (!result) {
      throw new ApiError(
        StatusCodes.EXPECTATION_FAILED,
        "Failed to add bookmark"
      );
    }
    return "Bookmark Added successfully";
  }
};

const getBookmark = async (user: JwtPayload): Promise<IBookmark[]> => {
  const result = await Bookmark.find({ user: user?.id });

  return result;
};

export const BookmarkService = { toggleBookmark, getBookmark };
