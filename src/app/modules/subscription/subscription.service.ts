import { verifyGooglePurchase } from "../../../handlers/googleVerify";
import { verifyApplePurchase } from "../../../handlers/appleVerify";
import { IVerifySubscription } from "./subscription.interface";

const verifySubscriptions = async (payload: IVerifySubscription) => {
  const { platform, purchaseToken, receiptData, productId, userId } = payload;

  let result;
  if (platform === "google") {
    result = await verifyGooglePurchase(purchaseToken, productId, userId);
  } else if (platform === "apple") {
    result = await verifyApplePurchase(receiptData, userId);
  } else {
    throw new Error("Invalid platform");
  }

  return result;
};

export const SubscriptionService = {
  verifySubscriptions,
};
