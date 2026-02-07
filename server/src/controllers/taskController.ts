import { Response, NextFunction, Request } from "express";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { ActivityLog } from "../models/activityLog.js";
import { RecurringTaskTemplate } from "../models/recurringTaskTemplate.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { TaskService } from "../services/task.service.js";
import { RecurringTaskService } from "../services/recurringTask.service.js";
import {
  ActivityLogService,
  LogActivityInput,
} from "../services/activityLog.service.js";
import { AppError } from "../services/errors.js";
import {
  NotificationService,
  NotificationPayload,
} from "../services/notification.service.js";

const getTaskService = (req: Request): TaskService => {
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new TaskService(taskDAO, groupDAO, userDAO);
};

const getRecurringTaskService = (req: Request): RecurringTaskService => {
  const recurringTaskDAO = req.app.locals[
    "recurringTaskDAO"
  ] as GenericDAO<RecurringTaskTemplate>;
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new RecurringTaskService(recurringTaskDAO, taskDAO, groupDAO, userDAO);
};

const getActivityLogService = (req: Request): ActivityLogService => {
  const activityLogDAO = req.app.locals[
    "activityLogDAO"
  ] as GenericDAO<ActivityLog>;
  return new ActivityLogService(activityLogDAO);
};

const getGroupDAO = (req: Request): GenericDAO<Group> => {
  return req.app.locals["groupDAO"] as GenericDAO<Group>;
};

const getUserDAO = (req: Request): GenericDAO<User> => {
  return req.app.locals["userDAO"] as GenericDAO<User>;
};

const getNotificationService = (req: Request): NotificationService => {
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new NotificationService(userDAO);
};

// Helper to send push notification without blocking the response
const sendNotificationAsync = (
  notificationService: NotificationService,
  userId: string,
  payload: NotificationPayload,
): void => {
  notificationService.sendNotificationToUser(userId, payload).catch((err) => {
    console.error("Failed to send push notification:", err);
  });
};

// Helper to log activity without blocking the response
const logActivityAsync = (
  activityLogService: ActivityLogService,
  input: LogActivityInput,
): void => {
  activityLogService.logActivity(input).catch((err) => {
    console.error("Failed to log activity:", err);
  });
};

/**
 * Erstellt eine neue Aufgabe in einer Gruppe
 * POST /api/groups/:groupId/tasks
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const activityLogService = getActivityLogService(req);
    const notificationService = getNotificationService(req);
    const groupDAO = getGroupDAO(req);
    const { groupId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const task = await taskService.createTask(groupId!, req.userId, {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
    });

    // Log activity
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);
    if (group) {
      logActivityAsync(activityLogService, {
        userId: req.userId,
        type: "created",
        taskId: task.id,
        taskTitle: task.title,
        groupId: groupId!,
        groupName: group.name,
      });
    }

    // Notify assigned user
    if (assignedTo && assignedTo !== req.userId) {
      sendNotificationAsync(notificationService, assignedTo, {
        title: "Neue Aufgabe zugewiesen",
        body: `Dir wurde "${task.title}" zugewiesen.`,
        url: `/dashboard/groups/${groupId}`,
      });
    }

    res.status(201).json({
      success: true,
      data: task,
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
 * Holt alle Aufgaben einer Gruppe
 * GET /api/groups/:groupId/tasks
 *
 * Automatisch werden fällige wiederkehrende Aufgaben generiert.
 */
export const getGroupTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const recurringTaskService = getRecurringTaskService(req);
    const { groupId } = req.params;

    // First, generate any due recurring tasks for today
    try {
      await recurringTaskService.generateDueTasks(groupId!, req.userId);
    } catch (error) {
      // Log but don't fail the request if recurring task generation fails
      console.error("Failed to generate recurring tasks:", error);
    }

    const tasks = await taskService.getGroupTasks(groupId!, req.userId);

    res.status(200).json({
      success: true,
      data: tasks,
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
 * Holt eine spezifische Aufgabe
 * GET /api/groups/:groupId/tasks/:taskId
 */
export const getTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;

    const task = await taskService.getTask(groupId!, taskId!, req.userId);

    res.status(200).json({
      success: true,
      data: task,
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
 * Aktualisiert eine Aufgabe
 * PATCH /api/groups/:groupId/tasks/:taskId
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const activityLogService = getActivityLogService(req);
    const notificationService = getNotificationService(req);
    const groupDAO = getGroupDAO(req);
    const { groupId, taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    // Get task before update to check status change
    const taskBefore = await taskService.getTask(groupId!, taskId!, req.userId);
    const wasCompleted = taskBefore.status === "completed";

    const task = await taskService.updateTask(groupId!, taskId!, req.userId, {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
    });

    // Log activity
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);
    if (group) {
      // Check if task was just completed
      if (status === "completed" && !wasCompleted) {
        logActivityAsync(activityLogService, {
          userId: req.userId,
          type: "completed",
          taskId: task.id,
          taskTitle: task.title,
          groupId: groupId!,
          groupName: group.name,
        });
      } else {
        logActivityAsync(activityLogService, {
          userId: req.userId,
          type: "updated",
          taskId: task.id,
          taskTitle: task.title,
          groupId: groupId!,
          groupName: group.name,
        });
      }
    }

    // Notify assigned user about the update
    if (task.assignedTo && task.assignedTo !== req.userId) {
      sendNotificationAsync(notificationService, task.assignedTo, {
        title: "Aufgabe aktualisiert",
        body: `Die Aufgabe "${task.title}" wurde überarbeitet.`,
        url: `/dashboard/groups/${groupId}`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
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
 * Löscht eine Aufgabe
 * DELETE /api/groups/:groupId/tasks/:taskId
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;

    await taskService.deleteTask(groupId!, taskId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Aufgabe gelöscht",
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
 * Weist eine Aufgabe einem User zu
 * PATCH /api/groups/:groupId/tasks/:taskId/assign
 */
export const assignTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const activityLogService = getActivityLogService(req);
    const notificationService = getNotificationService(req);
    const groupDAO = getGroupDAO(req);
    const userDAO = getUserDAO(req);
    const { groupId, taskId } = req.params;
    const { assignedTo } = req.body;

    const result = await taskService.assignTask(
      groupId!,
      taskId!,
      req.userId,
      assignedTo,
    );

    // Log activity if task was assigned (not unassigned)
    if (assignedTo) {
      const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);
      const assignedUser = await userDAO.findOne({
        id: assignedTo,
      } as Partial<User>);

      if (group) {
        const activityInput: LogActivityInput = {
          userId: req.userId,
          type: "assigned",
          taskId: result.task.id,
          taskTitle: result.task.title,
          groupId: groupId!,
          groupName: group.name,
        };
        if (assignedUser) {
          activityInput.details = `zugewiesen an ${assignedUser.name}`;
        }
        logActivityAsync(activityLogService, activityInput);
      }

      // Notify assigned user
      if (assignedTo !== req.userId) {
        sendNotificationAsync(notificationService, assignedTo, {
          title: "Aufgabe zugewiesen",
          body: `Dir wurde "${result.task.title}" zugewiesen.`,
          url: `/dashboard/groups/${groupId}`,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: result.task,
      message: result.message,
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
 * Erstellt eine Unteraufgabe für eine bestehende Aufgabe
 * POST /api/groups/:groupId/tasks/:taskId/subtasks
 */
export const createSubtask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const subtask = await taskService.createSubtask(
      groupId!,
      taskId!,
      req.userId,
      {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate,
      },
    );

    res.status(201).json({
      success: true,
      data: subtask,
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
 * Holt alle Unteraufgaben einer Aufgabe
 * GET /api/groups/:groupId/tasks/:taskId/subtasks
 */
export const getSubtasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;

    const subtasks = await taskService.getSubtasks(
      groupId!,
      taskId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: subtasks,
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
 * Holt eine Aufgabe mit allen Details (inkl. Subtasks und Gruppenname)
 * GET /api/groups/:groupId/tasks/:taskId/details
 */
export const getTaskWithDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;

    const taskWithDetails = await taskService.getTaskWithDetails(
      groupId!,
      taskId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: taskWithDetails,
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
 * Verknüpft zwei Aufgaben miteinander
 * POST /api/groups/:groupId/tasks/:taskId/links
 */
export const linkTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId } = req.params;
    const { targetTaskId, linkType } = req.body;

    const result = await taskService.linkTasks(
      groupId!,
      taskId!,
      targetTaskId,
      linkType,
      req.userId,
    );

    res.status(201).json({
      success: true,
      data: result.task,
      message: result.message,
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
 * Entfernt eine Verknüpfung zwischen zwei Aufgaben
 * DELETE /api/groups/:groupId/tasks/:taskId/links/:linkedTaskId
 */
export const unlinkTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId, taskId, linkedTaskId } = req.params;

    const result = await taskService.unlinkTasks(
      groupId!,
      taskId!,
      linkedTaskId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: result.task,
      message: result.message,
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
 * Archiviert alle erledigten Aufgaben einer Gruppe
 * POST /api/groups/:groupId/tasks/archive-completed
 */
export const archiveCompletedTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId } = req.params;

    const result = await taskService.archiveCompletedTasks(
      groupId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.archivedCount} Aufgabe(n) archiviert`,
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
 * Holt alle Aufgaben die dem aktuellen User zugewiesen sind
 * GET /api/tasks/my
 *
 * Automatisch werden fällige wiederkehrende Aufgaben generiert.
 */
export const getMyTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const recurringTaskService = getRecurringTaskService(req);
    const groupDAO = getGroupDAO(req);

    // Get all groups the user is a member of
    const allGroups = await groupDAO.findAll({} as Partial<Group>);
    const userGroups = allGroups.filter((g) =>
      g.members.some((m) => m.userId === req.userId)
    );

    // Generate due recurring tasks for each group
    for (const group of userGroups) {
      try {
        await recurringTaskService.generateDueTasks(group.id, req.userId);
      } catch (error) {
        // Log but don't fail the request
        console.error(
          `Failed to generate recurring tasks for group ${group.id}:`,
          error
        );
      }
    }

    const tasks = await taskService.getMyTasks(req.userId);

    res.status(200).json({
      success: true,
      data: tasks,
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
