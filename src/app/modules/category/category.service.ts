import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { CategoryStatus, ICategory } from "./category.interface";
import { Category } from "./category.model";
import unlinkFile from "../../../shared/unlinkFile";
import { RecentActivity } from "../recentActivity/recent-activity.model";
import { RecentActivityType } from "../recentActivity/recent-activity.interface";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

const createCategoryToDB = async (payload: ICategory) => {
  const { name, image } = payload;
  if (!image) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please provide category image"
    );
  }
  const isExistName = await Category.findOne({ name: name });

  if (isExistName) {
    unlinkFile(image);
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "This Category Name Already Exist"
    );
  }

  const createCategory = await Category.create(payload);
  if (!createCategory) {
    unlinkFile(image);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Category");
  }

  await RecentActivity.create({
    type: RecentActivityType.CATEGORY_CREATED,
    message: `New Service Category "${name}" created`,
  });

  return createCategory;
};

const getAllCategoriesFromDB = async (): Promise<ICategory[]> => {
  const result = await Category.find({
    status: CategoryStatus.ACTIVE,
  });
  return result;
};

const updateCategoryToDB = async (id: string, payload: Partial<ICategory>) => {
  const isExistCategory = await Category.findById(id);

  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }

  if (payload.image) {
    unlinkFile(isExistCategory?.image);
  }

  const updateCategory = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateCategory;
};

const deleteCategoryToDB = async (id: string): Promise<ICategory | null> => {
  const isCategoryUsed = await User.exists({
    role: USER_ROLES.PROVIDER,
    businessCategory: id,
  });

  if (isCategoryUsed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Category is used by providers and cannot be deleted"
    );
  }

  const deleteCategory = await Category.findByIdAndDelete(id);
  if (!deleteCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
  }
  unlinkFile(deleteCategory.image);
  return deleteCategory;
};

export const CategoryService = {
  createCategoryToDB,
  getAllCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB,
};
