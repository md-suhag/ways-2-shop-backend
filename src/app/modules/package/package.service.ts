import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";

const createPackage = async (payload: Partial<IPackage>) => {
  const existingPackage = await Package.findOne({ title: payload.title });
  if (existingPackage) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Package with this title already exists"
    );
  }
  await Package.create(payload);
};

const getAllActivePackagesFromDB = async () => {
  const packages = await Package.find({ isActive: true }).lean();
  return packages;
};

const updatePackageToDB = async (id: string, payload: Partial<IPackage>) => {
  const existingPackage = await Package.findById(id);
  if (!existingPackage) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
  }
  const updatedPackage = await Package.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedPackage;
};

export const PackageService = {
  createPackage,
  getAllActivePackagesFromDB,
  updatePackageToDB,
};
