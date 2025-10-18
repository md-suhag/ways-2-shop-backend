/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IService } from "./service.interface";
import { Service } from "./service.model";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import mongoose from "mongoose";

// import { FilterQuery } from "mongoose";

const createServiceToDB = async (
  payload: Partial<IService>,
  user: JwtPayload
) => {
  if (!payload.image) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service image is required");
  }
  payload.provider = user.id;

  // find provider
  const existedUser = await User.findById(user.id);
  if (!existedUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // attach provider's business categories
  if (existedUser.businessCategory && existedUser.businessCategory.length > 0) {
    payload.categories = existedUser.businessCategory;
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User has no business categories. Please update profile first."
    );
  }

  await Service.create(payload);
};

// const getAllServiceFromDB = async (payload: any, query: FilterQuery<any>) => {
//   const serviceQuery = new QueryBuilder(
//     Service.find({
//       //   coordinates: payload.coordinates,
//       //   coordinates: {
//       //     $near: {
//       //       $geometry: { type: "Point", coordinates: payload.coordinates },
//       //       $maxDistance: 10000,
//       //     },
//       //   },
//     }),
//     query
//   )
//     .paginate()
//     .filter()
//     .sort();

//   const [services, pagination] = await Promise.all([
//     serviceQuery.modelQuery.lean().exec(),
//     serviceQuery.getPaginationInfo(),
//   ]);

//   return {
//     services,
//     pagination,
//   };
// };

// const getAllServiceFromDB = async (payload: any, query: any) => {
//   const filter: any = {};

//   // category filter
//   if (payload?.category) filter.category = payload.category;

//   // geo location filter using $geoWithin
//   if (payload?.coordinates && payload?.distance) {
//     const [lng, lat] = payload.coordinates;

//     filter.coordinates = {
//       $geoWithin: {
//         $centerSphere: [
//           [lng, lat],
//           payload.distance / 6378137, // convert meters to radians
//         ],
//       },
//     };
//   }

//   const serviceQuery = new QueryBuilder(Service.find(filter), query)
//     .paginate()
//     .filter()
//     .sort();

//   const [services, pagination] = await Promise.all([
//     serviceQuery.modelQuery.lean().exec(),
//     serviceQuery.getPaginationInfo(),
//   ]);

//   return { services, pagination };
// };

///////
// const getAllServiceFromDB = async (payload: any, query: any) => {
//   const filter: any = {};

//   // category filter
//   if (payload?.category) {
//     filter.categories = { $in: [payload.category] };
//   }

//   // geo location filter using $geoWithin
//   if (payload?.coordinates && payload?.distance) {
//     const [lng, lat] = payload.coordinates;

//     filter.coordinates = {
//       $geoWithin: {
//         $centerSphere: [
//           [lng, lat],
//           payload.distance / 6378137, // convert meters to radians
//         ],
//       },
//     };
//   }

//   // build query with querybuilder
//   const serviceQuery = new QueryBuilder(Service.find(filter), query)
//     .paginate()
//     .filter()
//     .sort()

//   // Exclude description & image, populate provider + category
//   serviceQuery.modelQuery = serviceQuery.modelQuery
//     .select("-description -image -coordinates -locationName -categories")
//     .populate({
//       path: "provider",
//       select: "name profile totalReview totalJobs avgRating businessCategory",
//       populate: {
//         path: "businessCategory",
//         select: "name",
//       },
//     });
//   const [services, pagination] = await Promise.all([
//     serviceQuery.modelQuery.lean().exec(),
//     serviceQuery.getPaginationInfo(),
//   ]);

//   return { services, pagination };
// };
const getAllServiceFromDB = async (payload: any, query: any) => {
  const { page = 1, limit = 10, searchTerm, sort = "-createdAt" } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const matchStage: Record<string, any> = {
    isActive: true,
  };

  //  Category filter
  if (payload?.category) {
    try {
      matchStage.categories = {
        $in: [new mongoose.Types.ObjectId(payload.category)],
      };
    } catch {
      throw new Error("Invalid category ID format");
    }
  }

  //  Geo filter
  if (payload?.coordinates && payload?.distance) {
    const [lng, lat] = payload.coordinates;
    matchStage.coordinates = {
      $geoWithin: {
        $centerSphere: [[lng, lat], payload.distance / 6378137],
      },
    };
  }

  //  Base pipeline (no pagination yet)
  const basePipeline: any[] = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "provider",
        foreignField: "_id",
        as: "provider",
      },
    },
    { $unwind: "$provider" },
    {
      $lookup: {
        from: "categories",
        localField: "categories",
        foreignField: "_id",
        as: "categories",
      },
    },
    ...(searchTerm
      ? [
          {
            $match: {
              $or: [
                { description: { $regex: searchTerm, $options: "i" } },
                { "categories.name": { $regex: searchTerm, $options: "i" } },
              ],
            },
          },
        ]
      : []),
  ];

  //  Sort stage
  const sortStage: Record<string, 1 | -1> = {};
  const sortField = sort.replace(/^-/, "");
  const sortOrder = sort.startsWith("-") ? -1 : 1;
  if (["avgRating", "totalJobs", "totalReview"].includes(sortField))
    sortStage[`provider.${sortField}`] = sortOrder;
  else sortStage[sortField] = sortOrder;

  // Paginated pipeline
  const paginatedPipeline = [
    ...basePipeline,
    { $sort: sortStage },
    { $skip: skip },
    { $limit: Number(limit) },
    {
      $project: {
        ratePerHour: 1,
        provider: {
          name: 1,
          profile: 1,
          avgRating: 1,
          totalJobs: 1,
          totalReview: 1,
          businessCategory: 1,
        },
        categories: { name: 1 },
        createdAt: 1,
      },
    },
  ];

  //  Count pipeline (same filters but without skip/limit)
  const countPipeline = [...basePipeline, { $count: "total" }];

  const [results, countResult] = await Promise.all([
    Service.aggregate(paginatedPipeline),
    Service.aggregate(countPipeline),
  ]);

  const totalCount = countResult[0]?.total || 0;

  return {
    services: results,
    pagination: {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPage: Math.ceil(totalCount / Number(limit)) || 1,
    },
  };
};

const getSingleServiceFromDB = async (id: string) => {
  return await Service.findById(id)
    .select("description image ratePerHour")
    .populate({
      path: "provider",
      select: "name avgRating totalJobs",
      populate: {
        path: "businessCategory",
        select: "name -_id",
      },
    })
    .lean();
};

const getServiceReviewsFromDB = async (id: string) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ service: id })
      .select("customer rating comment createdAt")
      .populate("customer", "name profile"),
    {}
  )
    .paginate()
    .sort();

  const [reviews, pagination] = await Promise.all([
    reviewQuery.modelQuery.lean().exec(),
    reviewQuery.getPaginationInfo(),
  ]);
  return { reviews, pagination };
};

export const ServiceService = {
  createServiceToDB,
  getAllServiceFromDB,
  getSingleServiceFromDB,
  getServiceReviewsFromDB,
};
