import { Response, NextFunction, Request } from "express";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const getTaskDAO = (req: Request) =>
  req.app.locals["taskDAO"] as GenericDAO<Task>;

const getGroupDAO = (req: Request) =>
  req.app.locals["groupDAO"] as GenericDAO<Group>;

const getUserDAO = (req: Request) =>
  req.app.locals["userDAO"] as GenericDAO<User>;

// Helper: Check if user is member of group
const isMemberOfGroup = (group: Group, userId: string): boolean => {
  return group.members.some((m) => m.userId === userId);
};

export interface MonthlyTaskStats {
  month: string; // Format: "YYYY-MM"
  year: number;
  monthName: string;
  completed: number;
  created: number;
}

export interface MemberStats {
  userId: string;
  userName: string;
  completedTasks: number;
  assignedTasks: number;
  completionRate: number;
}

export interface TaskFrequency {
  title: string;
  count: number;
  groupName?: string;
}

export interface GroupStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  monthlyStats: MonthlyTaskStats[];
  memberStats: MemberStats[];
  mostFrequentTasks: TaskFrequency[];
  averageCompletionTime: number; // in days
}

export interface PersonalStatistics {
  totalAssigned: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  monthlyStats: MonthlyTaskStats[];
  tasksByGroup: { groupId: string; groupName: string; count: number }[];
  streak: number; // consecutive days with completed tasks
}

const MONTH_NAMES_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

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
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userDAO = getUserDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    // Check group
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Check membership
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

    // Get all tasks for this group (excluding subtasks for main stats)
    const allTasks = await taskDAO.findAll({ groupId } as Partial<Task>);
    const mainTasks = allTasks.filter((t) => !t.parentTaskId);

    const completedTasks = mainTasks.filter((t) => t.status === "completed");
    const pendingTasks = mainTasks.filter((t) => t.status === "pending");
    const inProgressTasks = mainTasks.filter((t) => t.status === "in-progress");

    // Monthly statistics (last 12 months)
    const monthlyStats: MonthlyTaskStats[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

      const completedInMonth = mainTasks.filter((t) => {
        if (t.status !== "completed" || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return (
          completedDate.getFullYear() === year &&
          completedDate.getMonth() === month
        );
      }).length;

      const createdInMonth = mainTasks.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return (
          createdDate.getFullYear() === year && createdDate.getMonth() === month
        );
      }).length;

      monthlyStats.push({
        month: monthKey,
        year,
        monthName: MONTH_NAMES_DE[month] || "Unbekannt",
        completed: completedInMonth,
        created: createdInMonth,
      });
    }

    // Member statistics
    const memberStats: MemberStats[] = [];
    for (const member of group.members) {
      const user = await userDAO.findOne({
        id: member.userId,
      } as Partial<User>);

      const memberAssigned = mainTasks.filter(
        (t) => t.assignedTo === member.userId,
      );
      const memberCompleted = memberAssigned.filter(
        (t) => t.status === "completed",
      );

      memberStats.push({
        userId: member.userId,
        userName: user?.name || user?.email || "Unbekannt",
        completedTasks: memberCompleted.length,
        assignedTasks: memberAssigned.length,
        completionRate:
          memberAssigned.length > 0
            ? Math.round((memberCompleted.length / memberAssigned.length) * 100)
            : 0,
      });
    }

    // Sort by completed tasks
    memberStats.sort((a, b) => b.completedTasks - a.completedTasks);

    // Most frequent completed tasks (by title)
    const taskFrequencyMap = new Map<string, number>();
    for (const task of completedTasks) {
      const title = task.title.toLowerCase().trim();
      taskFrequencyMap.set(title, (taskFrequencyMap.get(title) || 0) + 1);
    }

    const mostFrequentTasks: TaskFrequency[] = Array.from(taskFrequencyMap)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Average completion time
    let totalCompletionTime = 0;
    let tasksWithCompletionTime = 0;

    for (const task of completedTasks) {
      if (task.completedAt) {
        const createdDate = new Date(task.createdAt);
        const completedDate = new Date(task.completedAt);
        const diffTime = completedDate.getTime() - createdDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        totalCompletionTime += diffDays;
        tasksWithCompletionTime++;
      }
    }

    const averageCompletionTime =
      tasksWithCompletionTime > 0
        ? Math.round((totalCompletionTime / tasksWithCompletionTime) * 10) / 10
        : 0;

    const stats: GroupStatistics = {
      totalTasks: mainTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate:
        mainTasks.length > 0
          ? Math.round((completedTasks.length / mainTasks.length) * 100)
          : 0,
      monthlyStats,
      memberStats,
      mostFrequentTasks,
      averageCompletionTime,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
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
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;

    // Get all groups user is member of
    const allGroups = await groupDAO.findAll({} as Partial<Group>);
    const userGroups = allGroups.filter((g) => isMemberOfGroup(g, userId));

    // Get all tasks assigned to user
    const allTasks: (Task & { groupName: string })[] = [];

    for (const group of userGroups) {
      const groupTasks = await taskDAO.findAll({
        groupId: group.id,
        assignedTo: userId,
      } as Partial<Task>);

      for (const task of groupTasks) {
        // Skip subtasks for main stats
        if (!task.parentTaskId) {
          allTasks.push({ ...task, groupName: group.name });
        }
      }
    }

    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const pendingTasks = allTasks.filter((t) => t.status === "pending");
    const inProgressTasks = allTasks.filter((t) => t.status === "in-progress");

    // Monthly statistics (last 12 months)
    const monthlyStats: MonthlyTaskStats[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

      const completedInMonth = allTasks.filter((t) => {
        if (t.status !== "completed" || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return (
          completedDate.getFullYear() === year &&
          completedDate.getMonth() === month
        );
      }).length;

      const createdInMonth = allTasks.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return (
          createdDate.getFullYear() === year && createdDate.getMonth() === month
        );
      }).length;

      monthlyStats.push({
        month: monthKey,
        year,
        monthName: MONTH_NAMES_DE[month] || "Unbekannt",
        completed: completedInMonth,
        created: createdInMonth,
      });
    }

    // Tasks by group
    const tasksByGroupMap = new Map<
      string,
      { groupId: string; groupName: string; count: number }
    >();
    for (const task of allTasks) {
      if (!tasksByGroupMap.has(task.groupId)) {
        tasksByGroupMap.set(task.groupId, {
          groupId: task.groupId,
          groupName: task.groupName,
          count: 0,
        });
      }
      tasksByGroupMap.get(task.groupId)!.count++;
    }

    const tasksByGroup = Array.from(tasksByGroupMap.values()).sort(
      (a, b) => b.count - a.count,
    );

    // Calculate streak (consecutive days with completed tasks)
    const completedDates = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => {
        const d = new Date(t.completedAt!);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
      .sort()
      .reverse();

    const uniqueDates = [...new Set(completedDates)];
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

      if (uniqueDates.includes(checkDateStr)) {
        streak++;
      } else if (i > 0) {
        // Allow for yesterday not having tasks if today has
        break;
      }
    }

    const stats: PersonalStatistics = {
      totalAssigned: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      inProgressTasks: inProgressTasks.length,
      completionRate:
        allTasks.length > 0
          ? Math.round((completedTasks.length / allTasks.length) * 100)
          : 0,
      monthlyStats,
      tasksByGroup,
      streak,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
