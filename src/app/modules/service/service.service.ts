/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IService } from "./service.interface";
import { Service } from "./service.model";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";
// import { FilterQuery } from "mongoose";

const createServiceToDB = async (
  payload: Partial<IService>,
  user: JwtPayload
) => {
  if (!payload.image) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service image is required");
  }
  payload.provider = user.id;
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

const getAllServiceFromDB = async (payload: any, query: any) => {
  const filter: any = {};

  // category filter
  if (payload?.category) filter.category = payload.category;

  // geo location filter using $geoWithin
  if (payload?.coordinates && payload?.distance) {
    const [lng, lat] = payload.coordinates;

    filter.coordinates = {
      $geoWithin: {
        $centerSphere: [
          [lng, lat],
          payload.distance / 6378137, // convert meters to radians
        ],
      },
    };
  }

  // build query with querybuilder
  const serviceQuery = new QueryBuilder(Service.find(filter), query)
    .paginate()
    .filter()
    .sort();

  // Exclude description & image, populate provider + category
  serviceQuery.modelQuery = serviceQuery.modelQuery
    .select("-description -image") // exclude fields
    .populate({
      path: "provider",
      select: "name profile totalReview totalJobs totalRating businessCategory", // provider fields
    })
    .populate("category", "name"); // include category name only

  const [services, pagination] = await Promise.all([
    serviceQuery.modelQuery.lean().exec(),
    serviceQuery.getPaginationInfo(),
  ]);

  return { services, pagination };
};

export const ServiceService = {
  createServiceToDB,
  getAllServiceFromDB,
};
