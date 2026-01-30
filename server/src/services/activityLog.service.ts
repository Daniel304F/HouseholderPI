import {
  ActivityLog,
  ActivityLogResponse,
  ActivityType,
  DailyActivity,
} from "../models/activityLog.js";
import { GenericDAO } from "../models/generic.dao.js";
import { toISOString } from "../helpers/index.js";

export interface LogActivityInput {
  userId: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  groupId: string;
  groupName: string;
  details?: string;
}

export interface ActivityLogQueryOptions {
  type?: ActivityType | "all";
  limit?: number;
  offset?: number;
}

export class ActivityLogService {
  constructor(private activityLogDAO: GenericDAO<ActivityLog>) {}

  async logActivity(input: LogActivityInput): Promise<void> {
    await this.activityLogDAO.create({
      userId: input.userId,
      type: input.type,
      taskId: input.taskId,
      taskTitle: input.taskTitle,
      groupId: input.groupId,
      groupName: input.groupName,
      details: input.details,
    } as Omit<ActivityLog, "id" | "createdAt" | "updatedAt">);
  }

  async getActivityHeatmap(userId: string): Promise<DailyActivity[]> {
    const activities = await this.activityLogDAO.findAll({
      userId,
    } as Partial<ActivityLog>);

    // Calculate date range (365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    // Group activities by date
    const activityCountByDate = new Map<string, number>();

    for (const activity of activities) {
      const date = new Date(activity.createdAt);
      if (date >= startDate && date <= endDate) {
        const dateStr = this.formatDate(date);
        activityCountByDate.set(
          dateStr,
          (activityCountByDate.get(dateStr) || 0) + 1
        );
      }
    }

    // Find max count for level calculation
    const maxCount = Math.max(...Array.from(activityCountByDate.values()), 1);

    // Generate all dates in range
    const result: DailyActivity[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      const count = activityCountByDate.get(dateStr) || 0;
      const level = this.calculateLevel(count, maxCount);

      result.push({
        date: dateStr,
        count,
        level,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async getActivityLog(
    userId: string,
    options: ActivityLogQueryOptions = {}
  ): Promise<{ activities: ActivityLogResponse[]; total: number }> {
    const { type = "all", limit = 20, offset = 0 } = options;

    let activities = await this.activityLogDAO.findAll({
      userId,
    } as Partial<ActivityLog>);

    // Filter by type if not "all"
    if (type !== "all") {
      activities = activities.filter((a) => a.type === type);
    }

    const total = activities.length;

    // Sort by createdAt descending
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const paginatedActivities = activities.slice(offset, offset + limit);

    return {
      activities: paginatedActivities.map(this.toActivityLogResponse),
      total,
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private calculateLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  }

  private toActivityLogResponse(activity: ActivityLog): ActivityLogResponse {
    const response: ActivityLogResponse = {
      id: activity.id,
      userId: activity.userId,
      type: activity.type,
      taskId: activity.taskId,
      taskTitle: activity.taskTitle,
      groupId: activity.groupId,
      groupName: activity.groupName,
      createdAt: toISOString(activity.createdAt),
    };

    if (activity.details) {
      response.details = activity.details;
    }

    return response;
  }
}
