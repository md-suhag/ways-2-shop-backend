import { model, Query, Schema } from "mongoose";
import { USER_ROLES } from "../../../enums/user";
import { IsActive, IUser, UserModal } from "./user.interface";
import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: 0,
      minlength: 8,
    },
    contact: {
      type: String,
    },
    location: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    profile: {
      type: String,
      default:
        "https://res.cloudinary.com/dzo4husae/image/upload/v1733459922/zfyfbvwgfgshmahyvfyk.png",
    },
    businessCategory: [
      {
        type: String,
      },
    ],
    totalJobs: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    totalReview: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    appId: {
      type: String,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
    accountInformation: {
      status: {
        type: Boolean,
        default: false,
      },
      stripeAccountId: {
        type: String,
      },
      externalAccountId: {
        type: String,
      },
      currency: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUserExist: any = await User.findById(id);
  return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

userSchema.pre(/^find/, function (next) {
  if (this instanceof Query) {
    this.where({ isDeleted: false });
  }
  next();
});

//check user
userSchema.pre("save", async function (next) {
  //check user
  if (this.isNew) {
    const isExist = await User.findOne({ email: this.email });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exist!");
    }
  }

  //password hash
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }

  next();
});
export const User = model<IUser, UserModal>("User", userSchema);
