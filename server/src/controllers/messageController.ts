import { Response, NextFunction, Request } from "express";
import { Message } from "../models/message.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { MessageService } from "../services/message.service.js";
import { AppError } from "../services/errors.js";

const getMessageService = (req: Request): MessageService => {
  const messageDAO = req.app.locals["messageDAO"] as GenericDAO<Message>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new MessageService(messageDAO, groupDAO, userDAO);
};

/**
 * Erstellt eine neue Nachricht
 * POST /api/groups/:groupId/messages
 */
export const createMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageService = getMessageService(req);
    const { groupId } = req.params;
    const { content } = req.body;

    const message = await messageService.createMessage(
      groupId!,
      req.userId,
      content
    );

    // Emit socket event for real-time updates
    const io = req.app.locals["io"];
    if (io) {
      io.to(`group:${groupId}`).emit("message:new", message);
    }

    res.status(201).json({
      success: true,
      data: message,
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
 * Holt alle Nachrichten einer Gruppe
 * GET /api/groups/:groupId/messages
 */
export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageService = getMessageService(req);
    const { groupId } = req.params;
    const limit = parseInt(req.query["limit"] as string) || 50;
    const before = req.query["before"] as string | undefined;

    const result = await messageService.getMessages(
      groupId!,
      req.userId,
      limit,
      before
    );

    res.status(200).json({
      success: true,
      data: result.messages,
      hasMore: result.hasMore,
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
 * Aktualisiert eine Nachricht
 * PATCH /api/groups/:groupId/messages/:messageId
 */
export const updateMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageService = getMessageService(req);
    const { groupId, messageId } = req.params;
    const { content } = req.body;

    const message = await messageService.updateMessage(
      groupId!,
      messageId!,
      req.userId,
      content
    );

    // Emit socket event for real-time updates
    const io = req.app.locals["io"];
    if (io) {
      io.to(`group:${groupId}`).emit("message:update", message);
    }

    res.status(200).json({
      success: true,
      data: message,
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
 * Löscht eine Nachricht
 * DELETE /api/groups/:groupId/messages/:messageId
 */
export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messageService = getMessageService(req);
    const { groupId, messageId } = req.params;

    await messageService.deleteMessage(groupId!, messageId!, req.userId);

    // Emit socket event for real-time updates
    const io = req.app.locals["io"];
    if (io) {
      io.to(`group:${groupId}`).emit("message:delete", { messageId });
    }

    res.status(200).json({
      success: true,
      message: "Nachricht gelöscht",
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
