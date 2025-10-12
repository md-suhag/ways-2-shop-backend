import { Types } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { transporter } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { errorLogger, logger } from "../../../shared/logger";
import { IContactUs } from "../../../types/emailTemplate";
import QueryBuilder from "../../builder/QueryBuilder";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";
import { IsActive } from "../user/user.interface";
import { Category } from "../category/category.model";
import { Package } from "../package/package.model";

const contactUs = async (payload: IContactUs) => {
  const contactUsTemplate = emailTemplate.contactUs(payload);

  try {
    const info = await transporter.sendMail({
      from: `${payload.name} ${payload.email}`,
      to: contactUsTemplate.to,
      subject: contactUsTemplate.subject,
      html: contactUsTemplate.html,
      replyTo: `${payload.email}`,
    });

    logger.info("Mail send successfully", info.accepted);
  } catch (error) {
    errorLogger.error("Email", error);
  }
};

const getAllUsers = async (query: Record<string, unknown>) => {
  let baseQuery = User.find();

  if (query.role === USER_ROLES.PROVIDER) {
    baseQuery = baseQuery.populate("businessCategory", "name");
  }

  const usersQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .filter()
    .sort()
    .search(["name", "email", "location.locationName"]);

  const [users, pagination] = await Promise.all([
    usersQuery.modelQuery.lean(),
    usersQuery.getPaginationInfo(),
  ]);

  let usersWithBookingStatus = users;
  if (query.role === USER_ROLES.CUSTOMER) {
    const userIds = users.map((u) => u._id);
    const bookedUsers = await Booking.distinct("customer", {
      customer: { $in: userIds },
    });

    usersWithBookingStatus = users.map((u) => ({
      ...u,
      hasBooked: bookedUsers.some(
        (bookedUserId: Types.ObjectId) =>
          bookedUserId.toString() === (u._id as Types.ObjectId).toString()
      ),
    }));
  }

  return { users: usersWithBookingStatus, pagination };
};

const updateUserStatus = async (id: string, isActive: IsActive) => {
  const result = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).lean();
  return result;
};

const getAllCategories = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10, searchTerm = "", status } = query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchStage: any = {};

  //  Search by name
  if (searchTerm) {
    matchStage.name = { $regex: searchTerm, $options: "i" };
  }

  //  Filter by status
  if (status) {
    matchStage.status = status;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pipeline: any[] = [
    { $match: matchStage },

    //  Lookup related services
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "categories",
        as: "services",
      },
    },

    //  Extract providerIds from services
    {
      $addFields: {
        providerIds: {
          $map: { input: "$services", as: "s", in: "$$s.provider" },
        },
        serviceIds: {
          $map: { input: "$services", as: "s", in: "$$s._id" },
        },
      },
    },

    //  Lookup bookings for these services
    {
      $lookup: {
        from: "bookings",
        let: { serviceIds: "$serviceIds" },
        pipeline: [
          { $match: { $expr: { $in: ["$service", "$$serviceIds"] } } },
          { $project: { _id: 1 } }, // optimization
        ],
        as: "bookings",
      },
    },

    //  Add counts
    {
      $addFields: {
        totalProviders: {
          $size: { $ifNull: [{ $setUnion: ["$providerIds", []] }, []] },
        },
        totalJobs: { $size: "$bookings" },
      },
    },

    //  Keep only necessary fields
    {
      $project: {
        name: 1,
        image: 1,
        createdAt: 1,
        status: 1,
        totalProviders: 1,
        totalJobs: 1,
      },
    },

    //  Sort by latest created
    { $sort: { createdAt: -1 } },

    //  Pagination
    {
      $facet: {
        metadata: [
          { $count: "total" },
          {
            $addFields: {
              page: Number(page),
              limit: Number(limit),
            },
          },
        ],
        data: [
          { $skip: (Number(page) - 1) * Number(limit) },
          { $limit: Number(limit) },
        ],
      },
    },

    // Flatten output and add totalPages
    {
      $project: {
        data: 1,
        metadata: {
          $let: {
            vars: {
              meta: {
                $ifNull: [
                  { $arrayElemAt: ["$metadata", 0] },
                  { total: 0, page, limit },
                ],
              },
            },
            in: {
              total: "$$meta.total",
              page: "$$meta.page",
              limit: "$$meta.limit",
              totalPages: {
                $ceil: { $divide: ["$$meta.total", "$$meta.limit"] },
              },
            },
          },
        },
      },
    },
  ];

  const result = await Category.aggregate(pipeline);
  return result[0];
};

const getAllPackagesFromDB = async () => {
  const packages = await Package.find().lean();
  return packages;
};

export const AdminServices = {
  contactUs,
  getAllUsers,
  updateUserStatus,
  getAllCategories,
  getAllPackagesFromDB,
};
