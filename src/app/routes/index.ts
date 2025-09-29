import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.route";
import { ServiceRoutes } from "../modules/service/service.route";
import { BookmarkRoutes } from "../modules/bookmark/bookmark.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { MessageRoutes } from "../modules/message/message.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/services", route: ServiceRoutes },
  { path: "/bookmarks", route: BookmarkRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/bookings", route: BookingRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/admin", route: AdminRoutes },
  { path: "/chats", route: ChatRoutes },
  { path: "/messages", route: MessageRoutes },
  { path: "/notifications", route: NotificationRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
