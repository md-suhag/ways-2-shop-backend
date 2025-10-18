import express from "express";
import { UserRoutes } from "../app/modules/user/user.routes";
import { AuthRoutes } from "../app/modules/auth/auth.routes";
import { CategoryRoutes } from "../app/modules/category/category.route";
import { ServiceRoutes } from "../app/modules/service/service.route";
import { BookmarkRoutes } from "../app/modules/bookmark/bookmark.routes";
import { ReviewRoutes } from "../app/modules/review/review.routes";
import { BookingRoutes } from "../app/modules/booking/booking.route";
import { AdminRoutes } from "../app/modules/admin/admin.route";
import { ChatRoutes } from "../app/modules/chat/chat.routes";
import { MessageRoutes } from "../app/modules/message/message.routes";
import { NotificationRoutes } from "../app/modules/notification/notification.routes";
import { DisclaimerRoutes } from "../app/modules/disclaimer/disclaimer.route";
import { RecentServicesRoutes } from "../app/modules/recentServices/recent-services.route";
import { SubscriptionRoutes } from "../app/modules/subscription/subscription.routes";
import { PackageRoutes } from "../app/modules/package/package.routes";
import { AnalyticsRoutes } from "../app/modules/analytics/analytics.route";
import { RecentActivityRoutes } from "../app/modules/recentActivity/recent-activity.route";

const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/services", route: ServiceRoutes },
  { path: "/bookmarks", route: BookmarkRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/bookings", route: BookingRoutes },

  { path: "/admin", route: AdminRoutes },
  { path: "/chats", route: ChatRoutes },
  { path: "/messages", route: MessageRoutes },
  { path: "/notifications", route: NotificationRoutes },
  { path: "/recent-services", route: RecentServicesRoutes },
  { path: "/disclaimers", route: DisclaimerRoutes },
  { path: "/subscriptions", route: SubscriptionRoutes },
  { path: "/packages", route: PackageRoutes },
  { path: "/analytics", route: AnalyticsRoutes },
  { path: "/recent-activities", route: RecentActivityRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
