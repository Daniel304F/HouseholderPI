import { Response, NextFunction, Request } from "express";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { StatisticsService } from "../services/statistics.service.js";
import { AppError } from "../services/errors.js";

const getStatisticsService = (req: Request): StatisticsService => {
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new StatisticsService(taskDAO, groupDAO, userDAO);
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
