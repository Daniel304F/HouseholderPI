import { Response, NextFunction, Request } from "express";
import { Comment } from "../models/comment.js";
import { Task } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { CommentService } from "../services/comment.service.js";
import { AppError } from "../services/errors.js";

const getCommentService = (req: Request): CommentService => {
  const commentDAO = req.app.locals["commentDAO"] as GenericDAO<Comment>;
  const taskDAO = req.app.locals["taskDAO"] as GenericDAO<Task>;
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new CommentService(commentDAO, taskDAO, groupDAO, userDAO);
};

/**
 * Erstellt einen neuen Kommentar
 * POST /api/groups/:groupId/tasks/:taskId/comments
 */
export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentService = getCommentService(req);
    const { groupId, taskId } = req.params;
    const { content } = req.body;

    const comment = await commentService.createComment(
      groupId!,
      taskId!,
      req.userId,
      content
    );

    res.status(201).json({
      success: true,
      data: comment,
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
 * Holt alle Kommentare einer Aufgabe
 * GET /api/groups/:groupId/tasks/:taskId/comments
 */
export const getComments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentService = getCommentService(req);
    const { groupId, taskId } = req.params;

    const comments = await commentService.getComments(
      groupId!,
      taskId!,
      req.userId
    );

    res.status(200).json({
      success: true,
      data: comments,
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
 * Aktualisiert einen Kommentar
 * PATCH /api/groups/:groupId/tasks/:taskId/comments/:commentId
 */
export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentService = getCommentService(req);
    const { groupId, taskId, commentId } = req.params;
    const { content } = req.body;

    const comment = await commentService.updateComment(
      groupId!,
      taskId!,
      commentId!,
      req.userId,
      content
    );

    res.status(200).json({
      success: true,
      data: comment,
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
 * Löscht einen Kommentar
 * DELETE /api/groups/:groupId/tasks/:taskId/comments/:commentId
 */
export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commentService = getCommentService(req);
    const { groupId, taskId, commentId } = req.params;

    await commentService.deleteComment(
      groupId!,
      taskId!,
      commentId!,
      req.userId
    );

    res.status(200).json({
      success: true,
      message: "Kommentar gelöscht",
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
