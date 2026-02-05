import { Response, NextFunction, Request } from "express";
import { RecurringTaskTemplate } from "../models/recurringTaskTemplate.js";
import { Task, TaskAttachment } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { RecurringTaskService } from "../services/recurringTask.service.js";
import { AppError } from "../services/errors.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { UPLOAD_PATH } from "../config/upload.config.js";

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

/**
 * Get all attachments for a recurring task template
 * GET /api/groups/:groupId/recurring-tasks/:id/attachments
 */
export const getAttachments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const { groupId, id } = req.params;

    const template = await service.getTemplate(groupId!, id!, req.userId);

    const attachments = (template.attachments || []).map((a) => ({
      ...a,
      uploadedAt:
        a.uploadedAt instanceof Date ? a.uploadedAt.toISOString() : a.uploadedAt,
      url: `/uploads/${a.filename}`,
    }));

    res.status(200).json({
      success: true,
      data: attachments,
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
 * Upload attachment to a recurring task template
 * POST /api/groups/:groupId/recurring-tasks/:id/attachments
 */
export const uploadAttachment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const recurringTaskDAO = req.app.locals[
      "recurringTaskDAO"
    ] as GenericDAO<RecurringTaskTemplate>;
    const { groupId, id } = req.params;

    // Verify access by getting the template
    const template = await service.getTemplate(groupId!, id!, req.userId);

    // Check if file was uploaded
    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "Keine Datei hochgeladen" });
      return;
    }

    const newAttachment: TaskAttachment = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
    };

    const attachments = [...(template.attachments || []), newAttachment];

    await recurringTaskDAO.update({
      id: id,
      attachments,
    } as Partial<RecurringTaskTemplate>);

    res.status(201).json({
      success: true,
      data: {
        ...newAttachment,
        uploadedAt: newAttachment.uploadedAt.toISOString(),
        url: `/uploads/${newAttachment.filename}`,
      },
      message: "Datei erfolgreich hochgeladen",
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
 * Delete an attachment from a recurring task template
 * DELETE /api/groups/:groupId/recurring-tasks/:id/attachments/:attachmentId
 */
export const deleteAttachment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const service = getRecurringTaskService(req);
    const recurringTaskDAO = req.app.locals[
      "recurringTaskDAO"
    ] as GenericDAO<RecurringTaskTemplate>;
    const { groupId, id, attachmentId } = req.params;

    // Verify access by getting the template
    const template = await service.getTemplate(groupId!, id!, req.userId);

    // Find attachment
    const attachment = (template.attachments || []).find(
      (a) => a.id === attachmentId
    );

    if (!attachment) {
      res
        .status(404)
        .json({ success: false, message: "Anhang nicht gefunden" });
      return;
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_PATH, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from template
    const updatedAttachments = (template.attachments || []).filter(
      (a) => a.id !== attachmentId
    );

    await recurringTaskDAO.update({
      id: id,
      attachments: updatedAttachments,
    } as Partial<RecurringTaskTemplate>);

    res.status(200).json({
      success: true,
      message: "Anhang gelöscht",
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
