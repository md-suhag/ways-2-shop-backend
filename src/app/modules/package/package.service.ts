import { IPackage } from "./package.interface";
import { Package } from "./package.model";

const createPackage = async (payload: Partial<IPackage>) => {
  await Package.create(payload);
};

export const PackageService = { createPackage };
