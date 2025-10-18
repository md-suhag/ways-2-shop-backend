import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiErrors";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import { Booking } from "../booking/booking.model";
import { IBookingStatus } from "../booking/booking.interface";

const getAnalyticsOverview = async (range: string) => {
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const ranges: Record<string, Date | undefined> = {
    today: todayStart,
    "7d": new Date(now.setDate(now.getDate() - 7)),
    "30d": new Date(now.setDate(now.getDate() - 30)),
    all: undefined,
  };

  const startDate = range === "all" ? undefined : ranges[range] ?? ranges["7d"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchStage: any = {};
  if (startDate) matchStage.createdAt = { $gte: startDate };

  const [revenueResult, customerCount, providerCount, completedJobs] =
    await Promise.all([
      Subscription.aggregate([
        {
          $match: startDate
            ? { ...matchStage, status: { $in: ["active", "expired"] } }
            : { status: { $in: ["active", "expired"] } },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$priceAtPurchase" } } },
      ]),

      User.countDocuments({
        role: USER_ROLES.CUSTOMER,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),

      User.countDocuments({
        role: USER_ROLES.PROVIDER,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),

      Booking.countDocuments({
        status: IBookingStatus.COMPLETED,
        ...(startDate ? { createdAt: { $gte: startDate } } : {}),
      }),
    ]);

  return {
    range,
    customers: customerCount,
    providers: providerCount,
    completedJobs,
    subscriptionRevenue: revenueResult[0]?.totalRevenue || 0,
  };
};

const getTotalRevenue = async (query: Record<string, unknown>) => {
  // 1. Determine current year (or allow optional year param)
  const currentYear = query.year
    ? Number(query.year)
    : new Date().getFullYear();

  if (isNaN(currentYear) || currentYear < 2000 || currentYear > 2100) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid year parameter");
  }

  // 2. Define start and end dates for that year
  const startDate = new Date(currentYear, 0, 1); // Jan 1
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31

  // 3. Aggregate revenue by month
  const revenueByMonth = await Subscription.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["active", "expired"] },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$priceAtPurchase" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // 4. Fill missing months with zeros (Jan–Dec)
  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
  const merged = allMonths.map((month) => {
    const found = revenueByMonth.find((r) => r._id.month === month);
    return {
      month,
      revenue: found?.totalRevenue || 0,
      label: new Date(currentYear, month - 1).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };
  });

  // 5. Return formatted data
  return {
    year: currentYear,
    monthlyRevenue: merged,
    totalRevenue: merged.reduce((acc, m) => acc + m.revenue, 0),
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
  getTotalRevenue,
};
