import { Types } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { transporter } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import { errorLogger, logger } from "../../../shared/logger";
import { IContactUs } from "../../../types/emailTemplate";
import QueryBuilder from "../../builder/QueryBuilder";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";

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

export const AdminServices = { contactUs, getAllUsers };
