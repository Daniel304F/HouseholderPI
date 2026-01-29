import { Response, NextFunction, Request } from "express";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { GroupService } from "../services/group.service.js";
import { AppError } from "../services/errors.js";

const getGroupService = (req: Request): GroupService => {
  const groupDAO = req.app.locals["groupDAO"] as GenericDAO<Group>;
  const userDAO = req.app.locals["userDAO"] as GenericDAO<User>;
  return new GroupService(groupDAO, userDAO);
};

/**
 * Erstellt eine neue Gruppe
 * POST /api/groups
 */
export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { name, picture } = req.body;

    const group = await groupService.createGroup(req.userId, name, picture);

    res.status(201).json({
      success: true,
      data: group,
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
 * Holt alle Gruppen des eingeloggten Users
 * GET /api/groups
 */
export const getMyGroups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);

    const groups = await groupService.getMyGroups(req.userId);

    res.status(200).json({
      success: true,
      data: groups,
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
 * Holt eine spezifische Gruppe
 * GET /api/groups/:groupId
 */
export const getGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId } = req.params;

    const group = await groupService.getGroup(groupId!, req.userId);

    res.status(200).json({
      success: true,
      data: group,
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
 * Aktualisiert eine Gruppe
 * PATCH /api/groups/:groupId
 */
export const updateGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId } = req.params;
    const { name, picture } = req.body;

    const group = await groupService.updateGroup(groupId!, req.userId, {
      name,
      picture,
    });

    res.status(200).json({
      success: true,
      data: group,
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
 * Löscht eine Gruppe (nur Owner)
 * DELETE /api/groups/:groupId
 */
export const deleteGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId } = req.params;

    await groupService.deleteGroup(groupId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Gruppe gelöscht",
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
 * Tritt einer Gruppe per Invite-Code bei
 * POST /api/groups/join
 */
export const joinGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { inviteCode } = req.body;

    const result = await groupService.joinGroup(inviteCode, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.group,
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
 * Verlässt eine Gruppe
 * POST /api/groups/:groupId/leave
 */
export const leaveGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId } = req.params;

    await groupService.leaveGroup(groupId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Gruppe verlassen",
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
 * Generiert einen neuen Invite-Code (nur Admin/Owner)
 * POST /api/groups/:groupId/regenerate-invite
 */
export const regenerateInviteCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId } = req.params;

    const inviteCode = await groupService.regenerateInviteCode(
      groupId!,
      req.userId,
    );

    res.status(200).json({
      success: true,
      data: { inviteCode },
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
 * Aktualisiert ein Mitglied (Rolle, activeResident)
 * PATCH /api/groups/:groupId/members/:memberId
 */
export const updateMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId, memberId } = req.params;
    const { role, isActiveResident } = req.body;

    const member = await groupService.updateMember(
      groupId!,
      memberId!,
      req.userId,
      {
        role,
        isActiveResident,
      },
    );

    res.status(200).json({
      success: true,
      data: member,
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
 * Entfernt ein Mitglied aus der Gruppe (nur Admin/Owner)
 * DELETE /api/groups/:groupId/members/:memberId
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const groupService = getGroupService(req);
    const { groupId, memberId } = req.params;

    await groupService.removeMember(groupId!, memberId!, req.userId);

    res.status(200).json({
      success: true,
      message: "Mitglied entfernt",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
};
