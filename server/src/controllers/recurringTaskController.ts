import { Response, NextFunction, Request } from "express";
import { RecurringTaskTemplate } from "../models/recurringTaskTemplate.js";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { RecurringTaskService } from "../services/recurringTask.service.js";
import { AppError } from "../services/errors.js";

const getRecurringTaskService = (req: Request): RecurringTaskService => {
  const recurringTaskDAO = req.app.locals[
    "recurringTaskDAO"
  ] as GenericDAO<RecurringTaskTemplate>;
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new RecurringTaskService(recurringTaskDAO, taskDAO, groupDAO, userDAO);
};

/**
 * Get all recurring task templates for a group
 * GET /api/groups/:groupId/recurring-tasks
 */
export const getTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId } = req.params;

    const templates = await service.getTemplates(groupId!, req.userId);

    res.status(200).json({
      success: true,
      data: templates,
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
 * Get a specific recurring task template
 * GET /api/groups/:groupId/recurring-tasks/:id
 */
export const getTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;

    const template = await service.getTemplate(groupId!, id!, req.userId);

    res.status(200).json({
      success: true,
      data: template,
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
 * Create a new recurring task template
 * POST /api/groups/:groupId/recurring-tasks
 */
export const createTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId } = req.params;

    const template = await service.createTemplate(
      groupId!,
      req.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: template,
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
 * Update a recurring task template
 * PATCH /api/groups/:groupId/recurring-tasks/:id
 */
export const updateTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;

    const template = await service.updateTemplate(
      groupId!,
      id!,
      req.userId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: template,
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
 * Delete a recurring task template
 * DELETE /api/groups/:groupId/recurring-tasks/:id
 */
export const deleteTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;

    await service.deleteTemplate(groupId!, id!, req.userId);

    res.status(200).json({
      success: true,
      message: "Vorlage gelöscht",
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
 * Toggle active status of a recurring task template
 * POST /api/groups/:groupId/recurring-tasks/:id/toggle
 */
export const toggleTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;

    const template = await service.toggleTemplate(groupId!, id!, req.userId);

    res.status(200).json({
      success: true,
      data: template,
      message: template.isActive ? "Vorlage aktiviert" : "Vorlage deaktiviert",
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
 * Generate a task from a recurring task template
 * POST /api/groups/:groupId/recurring-tasks/:id/generate
 */
export const generateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;
    const { assignedTo } = req.body;

    const task = await service.generateTask(
      groupId!,
      id!,
      req.userId,
      assignedTo
    );

    res.status(201).json({
      success: true,
      data: task,
      message: "Aufgabe erstellt",
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
