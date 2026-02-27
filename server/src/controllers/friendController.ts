import { Response, NextFunction, Request } from "express";
import { Friendship } from "../models/friend.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { FriendService } from "../services/friend.service.js";
import { AppError } from "../services/errors.js";
import { DirectMessageAttachment, DirectMessage } from "../models/directMessage.js";
import { v4 as uuidv4 } from "uuid";

const getFriendService = (req: Request): FriendService => {
  const friendshipDAO = req.app.locals[
    "friendshipDAO"
  ] as GenericDAO<Friendship>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  const directMessageDAO = req.app.locals[
    "directMessageDAO"
  ] as GenericDAO<DirectMessage>;
  return new FriendService(friendshipDAO, userDAO, directMessageDAO);
};

/**
 * Get all friends of the current user
 * GET /api/friends
 */
export const getFriends = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);

    const friends = await friendService.getFriends(req.userId);

    res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get pending friend requests (received)
 * GET /api/friends/requests
 */
export const getFriendRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);

    const requests = await friendService.getFriendRequests(req.userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get sent friend requests (pending)
 * GET /api/friends/requests/sent
 */
export const getSentRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);

    const requests = await friendService.getSentRequests(req.userId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Send a friend request
 * POST /api/friends/request
 */
export const sendFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { email } = req.body;

    const result = await friendService.sendFriendRequest(req.userId, email);

    res.status(201).json({
      success: true,
      data: result.friendship,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Respond to a friend request (accept/reject)
 * POST /api/friends/requests/:requestId/respond
 */
export const respondToRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { requestId } = req.params;
    const { accept } = req.body;

    const message = await friendService.respondToRequest(
      requestId!,
      req.userId,
      accept,
    );

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Cancel a sent friend request
 * DELETE /api/friends/requests/:requestId
 */
export const cancelRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { requestId } = req.params;

    await friendService.cancelRequest(requestId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Freundschaftsanfrage zurückgezogen",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Remove a friend
 * DELETE /api/friends/:friendId
 */
export const removeFriend = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { friendId } = req.params;

    await friendService.removeFriend(friendId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Freund entfernt",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get friend's public profile
 * GET /api/friends/:friendId/profile
 */
export const getFriendProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { friendId } = req.params;

    const profile = await friendService.getFriendProfile(req.userId, friendId!);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Get direct messages with a friend
 * GET /api/friends/:friendId/messages
 */
export const getDirectMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { friendId } = req.params;
    const limit = parseInt(req.query["limit"] as string) || 50;
    const before = req.query["before"] as string | undefined;

    const result = await friendService.getDirectMessages(
      req.userId,
      friendId!,
      limit,
      before,
    );

    res.status(200).json({
      success: true,
      data: result.messages,
      hasMore: result.hasMore,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * Send direct message to a friend
 * POST /api/friends/:friendId/messages
 */
export const sendDirectMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friendService = getFriendService(req);
    const { friendId } = req.params;
    const { content } = req.body;

    const attachments: DirectMessageAttachment[] = req.file
      ? [
          {
            id: uuidv4(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          },
        ]
      : [];

    const message = await friendService.sendDirectMessage(
      req.userId,
      friendId!,
      content || "",
      attachments,
    );

    const io = req.app.locals["io"];
    if (io) {
      io.to(`user:${friendId}`).emit("direct-message:new", message);
      io.to(`user:${req.userId}`).emit("direct-message:new", message);
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
