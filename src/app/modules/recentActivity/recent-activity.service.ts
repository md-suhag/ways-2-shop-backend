import QueryBuilder from "../../builder/QueryBuilder";
import { RecentActivity } from "./recent-activity.model";

const getRecentActivityFromDB = async (query: Record<string, unknown>) => {
  const recentActivityQuery = new QueryBuilder(
    RecentActivity.find().select("message createdAt -_id"),
    query
  )
    .paginate()
    .sort();

  const [recentActivities, pagination] = await Promise.all([
    recentActivityQuery.modelQuery.lean(),
    recentActivityQuery.getPaginationInfo(),
  ]);

  return {
    data: recentActivities,
    pagination,
  };
};

export const RecentActivityService = {
  getRecentActivityFromDB,
};
