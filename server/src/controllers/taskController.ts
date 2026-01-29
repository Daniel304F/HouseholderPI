import { Response, NextFunction, Request } from "express";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { TaskService } from "../services/task.service.js";
import { AppError } from "../services/errors.js";

const getTaskService = (req: Request): TaskService => {
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new TaskService(taskDAO, groupDAO, userDAO);
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
 */
export const getGroupTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);
    const { groupId } = req.params;

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
    const { groupId, taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const task = await taskService.updateTask(groupId!, taskId!, req.userId, {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
    });

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
    const { groupId, taskId } = req.params;
    const { assignedTo } = req.body;

    const result = await taskService.assignTask(
      groupId!,
      taskId!,
      req.userId,
      assignedTo,
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
 * Holt alle Aufgaben die dem aktuellen User zugewiesen sind
 * GET /api/tasks/my
 */
export const getMyTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskService = getTaskService(req);

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
