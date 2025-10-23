import { Bookmark } from "../bookmark/bookmark.model";
import { Service } from "../service/service.model";
import { IRecentServices } from "./recent-services.interface";
import { RecentServices } from "./recent-services.model";

// create recent services
const createRecentServices = async (payload: IRecentServices) => {
  // check if the service is exist
  const isExistService = await Service.findById(payload.service);
  if (!isExistService) {
    throw new Error("Service not found");
  }

  // check if recent services already exists
  const isExist = await RecentServices.findOne(payload);
  if (isExist) {
    const result = await RecentServices.findByIdAndUpdate(
      isExist._id,
      {},
      { new: true }
    );
    return result;
  }

  // create recent services
  const result = await RecentServices.create(payload);
  // delete older recent services if more than 10
  const recentServices = await RecentServices.find({
    user: payload.user,
  }).sort({ updatedAt: -1 });
  if (recentServices.length > 10) {
    const recentServicesToDelete = recentServices.slice(10);
    const recentServicesToDeleteIds = recentServicesToDelete.map(
      (item) => item._id
    );
    await RecentServices.deleteMany({
      _id: { $in: recentServicesToDeleteIds },
    });
  }
  return result;
};

// get recent services by user id
const getUserRecentServices = async (id: string) => {
  // Fetch recent services
  const recentServices = await RecentServices.find({ user: id })
    .sort({ updatedAt: -1 })
    .populate({
      path: "service",
      select: "ratePerHour provider categories",
      populate: [
        {
          path: "provider",
          select: "name avgRating totalReview profile totalJobs",
        },
        {
          path: "categories",
          select: "name",
        },
      ],
    })
    .limit(10)
    .lean();

  // Get user's bookmarked service IDs
  const bookmarks = await Bookmark.find({ user: id }).select("service").lean();
  const favoriteIds = new Set(bookmarks.map((b) => b.service.toString()));

  // Attach isFavorite to each service
  const formattedResult = recentServices.map((item) => {
    const service = item.service;
    return {
      ...service,
      isFavorite: favoriteIds.has(service._id.toString()),
    };
  });

  return formattedResult;
};
export const RecentCompaniesServices = {
  createRecentServices,
  getUserRecentServices,
};
