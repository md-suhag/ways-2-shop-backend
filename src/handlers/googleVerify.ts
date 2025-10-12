import { google } from "googleapis";
import { Package } from "../app/modules/package/package.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

const keyFilePath = "config/google-service-account.json"; // Your credentials file

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const androidPublisher = google.androidpublisher({
  version: "v3",
  auth,
});

export const verifyGooglePurchase = async (
  purchaseToken: string,
  productId: string,
  userId: string
) => {
  const packageName = "com.yourapp.package"; // Replace with your  package name

  try {
    const res = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    const purchase = res.data;

    //  Check validity of required fields
    if (!purchase.startTimeMillis || !purchase.expiryTimeMillis) {
      throw new Error("Missing purchase time data");
    }

    if (purchase.paymentState !== 1) {
      throw new Error("Purchase not completed or not active.");
    }

    const startMillis = Number(purchase.startTimeMillis);
    const expiryMillis = Number(purchase.expiryTimeMillis);

    if (isNaN(startMillis) || isNaN(expiryMillis)) {
      throw new Error("Invalid time format in Google response");
    }

    const startDate = new Date(startMillis);
    const endDate = new Date(expiryMillis);

    const isActive = expiryMillis > Date.now();

    await Subscription.create({
      user: userId,
      package: (await Package.findOne({ googleProductId: productId }))?._id,
      platform: "google",
      transactionId: purchase.orderId,
      purchaseToken,
      startDate,
      endDate,
      isActive,
      status: isActive ? "active" : "expired",
    });

    return purchase;
  } catch (err: any) {
    console.error("Google verification failed:", err.message);
    throw new Error("Invalid Google purchase");
  }
};
