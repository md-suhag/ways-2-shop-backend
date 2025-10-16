import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import unlinkFile from "../../../shared/unlinkFile";
import { USER_ROLES } from "../../../enums/user";
import stripe from "../../../config/stripe";

const createAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  // check admin is exist or not;
  const isExistAdmin = await User.findOne({ email: payload.email });
  if (isExistAdmin) {
    throw new ApiError(StatusCodes.CONFLICT, "This Email already taken");
  }
  payload.role = USER_ROLES.ADMIN;
  // create admin to db
  const createAdmin = await User.create(payload);
  if (!createAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Admin");
  } else {
    await User.findByIdAndUpdate(
      createAdmin?._id,
      { isVerified: true },
      { new: true }
    );
  }

  return createAdmin;
};

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  const isUserExist = await User.findOne({ email: payload.email });

  if (isUserExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User Already Exist");
  }

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email,
  };

  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id, role } = user;

  let query = User.findOne({ _id: id });

  // Only populate businessCategory if provider
  if (role === USER_ROLES.PROVIDER) {
    query = query.populate("businessCategory", "name");
  }

  const isExistUser = await query;
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.profile && isExistUser.profile) {
    unlinkFile(isExistUser.profile);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return updateDoc;
};

const createConnectedAccount = async (user: JwtPayload) => {
  const provider = await User.findById(user.id);
  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: provider?.email,
  });

  provider.stripeAccountId = account.id;

  await provider.save();

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "https://yourapp.com/refresh",
    return_url: "https://yourapp.com/success",
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  createAdminToDB,
  createConnectedAccount,
};
