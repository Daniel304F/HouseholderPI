import { Response, NextFunction, Request } from "express";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { ActivityLog, ActivityType } from "../models/activityLog.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { StatisticsService } from "../services/statistics.service.js";
import { ActivityLogService } from "../services/activityLog.service.js";
import { AppError } from "../services/errors.js";

const getStatisticsService = (req: Request): StatisticsService => {
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new StatisticsService(taskDAO, groupDAO, userDAO);
};

const getActivityLogService = (req: Request): ActivityLogService => {
  const activityLogDAO = req.app.locals["activityLogDAO"] as GenericDAO<ActivityLog>;
  return new ActivityLogService(activityLogDAO);
};

/**
 * Get statistics for a group
 * GET /api/groups/:groupId/statistics
 */
export const getGroupStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const statisticsService = getStatisticsService(req);
    const { groupId } = req.params;

    const stats = await statisticsService.getGroupStatistics(
      groupId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get personal statistics for the logged in user
 * GET /api/statistics/personal
 */
export const getPersonalStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const statisticsService = getStatisticsService(req);

    const stats = await statisticsService.getPersonalStatistics(req.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get activity heatmap data (365 days)
 * GET /api/statistics/personal/activity
 */
export const getActivityHeatmap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const activityLogService = getActivityLogService(req);

    const heatmap = await activityLogService.getActivityHeatmap(req.userId);

    res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get paginated activity log
 * GET /api/statistics/personal/activity-log?type=all&limit=20&offset=0
 */
export const getActivityLog = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const activityLogService = getActivityLogService(req);
    const { type = "all", limit = "20", offset = "0" } = req.query;

    const validTypes: (ActivityType | "all")[] = [
      "all",
      "created",
      "assigned",
      "updated",
      "completed",
    ];
    const filterType = validTypes.includes(type as ActivityType | "all")
      ? (type as ActivityType | "all")
      : "all";

    const result = await activityLogService.getActivityLog(req.userId, {
      type: filterType,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    res.status(200).json({
      success: true,
      data: result.activities,
      meta: {
        total: result.total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
