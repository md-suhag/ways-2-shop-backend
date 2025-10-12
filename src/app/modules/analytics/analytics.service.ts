import { USER_ROLES } from "../../../enums/user";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";

export const getAnalyticsOverview = async () => {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const last7Days = new Date(now);
  last7Days.setDate(now.getDate() - 7);

  const last30Days = new Date(now);
  last30Days.setDate(now.getDate() - 30);

  const getRevenue = async (startDate?: Date) => {
    const matchStage: any = {};
    if (startDate) matchStage.createdAt = { $gte: startDate };

    const result = await Subscription.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalRevenue: { $sum: "$priceAtPurchase" } } },
    ]);

    return result[0]?.totalRevenue || 0;
  };

  const totalCustomersPromise = User.countDocuments({
    role: USER_ROLES.CUSTOMER,
  });
  const todayCustomersPromise = User.countDocuments({
    role: USER_ROLES.CUSTOMER,
    createdAt: { $gte: todayStart },
  });
  const last7DaysCustomersPromise = User.countDocuments({
    role: USER_ROLES.CUSTOMER,
    createdAt: { $gte: last7Days },
  });
  const last30DaysCustomersPromise = User.countDocuments({
    role: USER_ROLES.CUSTOMER,
    createdAt: { $gte: last30Days },
  });

  const totalProvidersPromise = User.countDocuments({
    role: USER_ROLES.PROVIDER,
  });
  const todayProvidersPromise = User.countDocuments({
    role: USER_ROLES.PROVIDER,
    createdAt: { $gte: todayStart },
  });
  const last7DaysProvidersPromise = User.countDocuments({
    role: USER_ROLES.PROVIDER,
    createdAt: { $gte: last7Days },
  });
  const last30DaysProvidersPromise = User.countDocuments({
    role: USER_ROLES.PROVIDER,
    createdAt: { $gte: last30Days },
  });

  //  Revenue calculations
  const totalRevenuePromise = getRevenue();
  const todayRevenuePromise = getRevenue(todayStart);
  const last7DaysRevenuePromise = getRevenue(last7Days);
  const last30DaysRevenuePromise = getRevenue(last30Days);

  const [
    totalCustomers,
    todayCustomers,
    last7DaysCustomers,
    last30DaysCustomers,

    totalProviders,
    todayProviders,
    last7DaysProviders,
    last30DaysProviders,

    totalRevenue,
    todayRevenue,
    last7DaysRevenue,
    last30DaysRevenue,
  ] = await Promise.all([
    totalCustomersPromise,
    todayCustomersPromise,
    last7DaysCustomersPromise,
    last30DaysCustomersPromise,

    totalProvidersPromise,
    todayProvidersPromise,
    last7DaysProvidersPromise,
    last30DaysProvidersPromise,

    totalRevenuePromise,
    todayRevenuePromise,
    last7DaysRevenuePromise,
    last30DaysRevenuePromise,
  ]);

  return {
    customers: {
      total: totalCustomers,
      today: todayCustomers,
      last7Days: last7DaysCustomers,
      last30Days: last30DaysCustomers,
    },
    providers: {
      total: totalProviders,
      today: todayProviders,
      last7Days: last7DaysProviders,
      last30Days: last30DaysProviders,
    },
    subscriptionRevenue: {
      total: totalRevenue,
      today: todayRevenue,
      last7Days: last7DaysRevenue,
      last30Days: last30DaysRevenue,
    },
  };
};

export const AnalyticsService = { getAnalyticsOverview };
