import axios from "axios";
import { Subscription } from "../app/modules/subscription/subscription.model";
import { Package } from "../app/modules/package/package.model";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const APPLE_SHARED_SECRET = process.env.APPLE_SHARED_SECRET!;

export const verifyApplePurchase = async (
  receiptData: string,
  userId: string
) => {
  const response = await axios.post(
    "https://buy.itunes.apple.com/verifyReceipt",
    {
      "receipt-data": receiptData,
      password: APPLE_SHARED_SECRET,
      "exclude-old-transactions": true,
    }
  );

  const data = response.data;

  if (data.status !== 0) {
    throw new Error("Invalid Apple receipt");
  }

  const latest = data.latest_receipt_info?.[0];
  if (
    !latest ||
    !latest.product_id ||
    !latest.transaction_id ||
    !latest.purchase_date_ms ||
    !latest.expires_date_ms
  ) {
    throw new Error("Incomplete Apple receipt data");
  }

  const purchaseMillis = Number(latest.purchase_date_ms);
  const expiryMillis = Number(latest.expires_date_ms);

  if (isNaN(purchaseMillis) || isNaN(expiryMillis)) {
    throw new Error("Invalid timestamp format in Apple receipt");
  }

  const startDate = new Date(purchaseMillis);
  const endDate = new Date(expiryMillis);
  const isActive = expiryMillis > Date.now();

  const pkg = await Package.findOne({ appleProductId: latest.product_id });
  if (!pkg) throw new Error("Package not found for product_id");

  await Subscription.create({
    user: userId,
    package: pkg._id,
    platform: "apple",
    transactionId: latest.transaction_id,
    receiptData,
    startDate,
    endDate,
    isActive,
    status: isActive ? "active" : "expired",
    priceAtPurchase: pkg.price,
  });

  return latest;
};
