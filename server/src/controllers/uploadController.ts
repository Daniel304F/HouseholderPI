import { Response, NextFunction, Request } from "express";
import { Task, TaskAttachment, CompletionProof } from "../models/task.js";
import { Group } from "../models/group.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { UPLOAD_PATH } from "../config/upload.config.js";

const getTaskDAO = (req: Request) =>
  req.app.locals["taskDAO"] as GenericDAO<Task>;

const getGroupDAO = (req: Request) =>
  req.app.locals["groupDAO"] as GenericDAO<Group>;

// Helper: Check if user is member of group
const isMemberOfGroup = (group: Group, userId: string): boolean => {
  return group.members.some((m) => m.userId === userId);
};

/**
 * Upload attachment to a task
 * POST /api/groups/:groupId/tasks/:taskId/attachments
 */
export const uploadAttachment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;

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

    // Check task
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

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
      uploadedBy: userId,
      uploadedAt: new Date(),
    };

    const attachments = [...(task.attachments || []), newAttachment];

    await taskDAO.update({
      id: taskId,
      attachments,
    } as Partial<Task>);

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
    next(error);
  }
};

/**
 * Delete an attachment from a task
 * DELETE /api/groups/:groupId/tasks/:taskId/attachments/:attachmentId
 */
export const deleteAttachment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId, attachmentId } = req.params;

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

    // Check task
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

    // Find attachment
    const attachment = (task.attachments || []).find(
      (a) => a.id === attachmentId,
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

    // Remove from task
    const updatedAttachments = (task.attachments || []).filter(
      (a) => a.id !== attachmentId,
    );

    await taskDAO.update({
      id: taskId,
      attachments: updatedAttachments,
    } as Partial<Task>);

    res.status(200).json({
      success: true,
      message: "Anhang gelöscht",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload completion proof when completing a task
 * POST /api/groups/:groupId/tasks/:taskId/complete
 */
export const completeTaskWithProof = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;
    const { note } = req.body;

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

    // Check task
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

    // Build completion proof if file was uploaded
    let completionProof: CompletionProof | null = null;
    if (req.file) {
      completionProof = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadedBy: userId,
        uploadedAt: new Date(),
        note: note || undefined,
      };
    }

    // Update task to completed
    await taskDAO.update({
      id: taskId,
      status: "completed",
      completionProof,
      completedAt: new Date(),
      completedBy: userId,
    } as Partial<Task>);

    const updatedTask = await taskDAO.findOne({ id: taskId } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: updatedTask,
      message: "Aufgabe als erledigt markiert",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attachments for a task
 * GET /api/groups/:groupId/tasks/:taskId/attachments
 */
export const getAttachments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;

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

    // Check task
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

    const attachments = (task.attachments || []).map((a) => ({
      ...a,
      uploadedAt:
        a.uploadedAt instanceof Date
          ? a.uploadedAt.toISOString()
          : a.uploadedAt,
      url: `/uploads/${a.filename}`,
    }));

    res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
};
