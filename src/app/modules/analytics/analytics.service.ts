import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiErrors";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";

const getAnalyticsOverview = async () => {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const last7Days = new Date(now);
  last7Days.setDate(now.getDate() - 7);

  const last30Days = new Date(now);
  last30Days.setDate(now.getDate() - 30);

  const getRevenue = async (startDate?: Date) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const getMonthlyRevenueUsers = async (query: Record<string, unknown>) => {
  const startYear = Number(query.startYear);
  const startMonth = Number(query.startMonth);
  const endYear = Number(query.endYear);
  const endMonth = Number(query.endMonth);

  if (
    !startYear ||
    !startMonth ||
    !endYear ||
    !endMonth ||
    startMonth < 1 ||
    startMonth > 12 ||
    endMonth < 1 ||
    endMonth > 12
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid or missing query parameters: startYear, startMonth, endYear, endMonth are required and must be valid numbers."
    );
  }

  // 1. Build date range
  const startDate = new Date(startYear, startMonth - 1, 1);
  const endDate = new Date(endYear, endMonth, 0, 23, 59, 59, 999);

  //  2. Aggregations
  const [revenueByMonth, customersByMonth, providersByMonth] =
    await Promise.all([
      //  Subscriptions: only active or expired
      Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $in: ["active", "expired"] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalRevenue: { $sum: "$priceAtPurchase" },
          },
        },
      ]),

      //  Customers
      User.aggregate([
        {
          $match: {
            role: USER_ROLES.CUSTOMER,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalCustomers: { $sum: 1 },
          },
        },
      ]),

      //  Providers
      User.aggregate([
        {
          $match: {
            role: USER_ROLES.PROVIDER,
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalProviders: { $sum: 1 },
          },
        },
      ]),
    ]);

  //  3. Merge data into one object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged: Record<string, any> = {};
  const makeKey = (y: number, m: number) =>
    `${y}-${String(m).padStart(2, "0")}`;

  for (const r of revenueByMonth) {
    const key = makeKey(r._id.year, r._id.month);
    merged[key] = {
      month: key,
      revenue: r.totalRevenue,
      customers: 0,
      providers: 0,
    };
  }

  for (const c of customersByMonth) {
    const key = makeKey(c._id.year, c._id.month);
    merged[key] = {
      ...(merged[key] || {
        month: key,
        revenue: 0,
        customers: 0,
        providers: 0,
      }),
      customers: c.totalCustomers,
    };
  }

  for (const p of providersByMonth) {
    const key = makeKey(p._id.year, p._id.month);
    merged[key] = {
      ...(merged[key] || {
        month: key,
        revenue: 0,
        customers: 0,
        providers: 0,
      }),
      providers: p.totalProviders,
    };
  }

  // 4. Generate months between range (fill with zeros)
  const months: {
    month: string;
    revenue: number;
    customers: number;
    providers: number;
  }[] = [];
  const current = new Date(startYear, startMonth - 1, 1);

  while (current <= endDate) {
    const y = current.getFullYear();
    const m = current.getMonth() + 1;
    const key = makeKey(y, m);

    months.push({
      month: key,
      revenue: merged[key]?.revenue || 0,
      customers: merged[key]?.customers || 0,
      providers: merged[key]?.providers || 0,
    });

    current.setMonth(current.getMonth() + 1);
  }

  //  5. Format for display (Jan 2025, Feb 2025, etc.)
  const formatted = months.map((item) => ({
    ...item,
    label: new Date(item.month + "-01").toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }),
  }));

  return formatted;
};

export const AnalyticsService = {
  getAnalyticsOverview,
  getMonthlyRevenueUsers,
};
