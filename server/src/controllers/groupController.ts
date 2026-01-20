import { Response, NextFunction, Request } from "express";
import { Group, GroupListItem, GroupMember } from "../models/group.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import crypto from "crypto";

const getGroupDAO = (req: Request) =>
  req.app.locals["groupDAO"] as GenericDAO<Group>;

// Hilfsfunktion: Invite-Code generieren
const generateInviteCode = (): string => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Hilfsfunktion: Prüfen ob User Mitglied einer Gruppe ist
const getMemberRole = (
  group: Group,
  userId: string
): GroupMember["role"] | null => {
  const member = group.members.find((m) => m.userId === userId);
  return member?.role ?? null;
};

// Hilfsfunktion: Prüfen ob User Admin/Owner ist
const isAdminOrOwner = (group: Group, userId: string): boolean => {
  const role = getMemberRole(group, userId);
  return role === "owner" || role === "admin";
};

/**
 * Erstellt eine neue Gruppe
 * POST /api/groups
 */
export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { name, picture } = req.body;

    const newGroup = await groupDAO.create({
      name,
      inviteCode: generateInviteCode(),
      members: [
        {
          userId,
          role: "owner",
          isActiveResident: true,
          joinedAt: new Date(),
        },
      ],
      activeResidentsCount: 1,
      picture,
    } as Omit<Group, "id" | "createdAt" | "updatedAt">);

    res.status(201).json({
      success: true,
      data: newGroup,
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;

    const allGroups = await groupDAO.findAll();

    const userGroups: GroupListItem[] = allGroups
      .filter((group) => group.members.some((m) => m.userId === userId))
      .map((group) => {
        const member = group.members.find((m) => m.userId === userId)!;
        return {
          id: group.id,
          name: group.name,
          memberCount: group.members.length,
          activeResidentsCount: group.activeResidentsCount,
          picture: group.picture,
          role: member.role,
        };
      });

    res.status(200).json({
      success: true,
      data: userGroups,
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!getMemberRole(group, userId)) {
      res.status(403).json({ message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;
    const { name, picture } = req.body;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    if (!isAdminOrOwner(group, userId)) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }

    const updated = await groupDAO.update({
      id: groupId,
      ...(name && { name }),
      ...(picture !== undefined && { picture }),
    } as Partial<Group>);

    if (!updated) {
      res.status(500).json({ message: "Aktualisierung fehlgeschlagen" });
      return;
    }

    const updatedGroup = await groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    res.status(200).json({
      success: true,
      data: updatedGroup,
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    if (getMemberRole(group, userId) !== "owner") {
      res.status(403).json({ message: "Nur der Owner kann die Gruppe löschen" });
      return;
    }

    if (groupId) {
      await groupDAO.delete(groupId);
    }

    res.status(200).json({
      success: true,
      message: "Gruppe gelöscht",
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { inviteCode } = req.body;

    const group = await groupDAO.findOne({
      inviteCode,
    } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Ungültiger Invite-Code" });
      return;
    }

    // Prüfen ob User bereits Mitglied ist
    if (getMemberRole(group, userId)) {
      res.status(409).json({ message: "Du bist bereits Mitglied dieser Gruppe" });
      return;
    }

    const newMember: GroupMember = {
      userId,
      role: "member",
      isActiveResident: false,
      joinedAt: new Date(),
    };

    const updated = await groupDAO.update({
      id: group.id,
      members: [...group.members, newMember],
    } as Partial<Group>);

    if (!updated) {
      res.status(500).json({ message: "Beitritt fehlgeschlagen" });
      return;
    }

    const updatedGroup = await groupDAO.findOne({ id: group.id } as Partial<Group>);

    res.status(200).json({
      success: true,
      message: "Erfolgreich beigetreten",
      data: updatedGroup,
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    const memberRole = getMemberRole(group, userId);

    if (!memberRole) {
      res.status(403).json({ message: "Du bist kein Mitglied dieser Gruppe" });
      return;
    }

    // Owner kann nicht einfach verlassen
    if (memberRole === "owner") {
      res.status(400).json({
        message:
          "Als Owner musst du die Gruppe löschen oder einen anderen Owner bestimmen",
      });
      return;
    }

    const member = group.members.find((m) => m.userId === userId)!;
    const updatedMembers = group.members.filter((m) => m.userId !== userId);
    const newActiveCount = member.isActiveResident
      ? group.activeResidentsCount - 1
      : group.activeResidentsCount;

    await groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);

    res.status(200).json({
      success: true,
      message: "Gruppe verlassen",
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    if (!isAdminOrOwner(group, userId)) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }

    const newInviteCode = generateInviteCode();

    await groupDAO.update({
      id: groupId,
      inviteCode: newInviteCode,
    } as Partial<Group>);

    res.status(200).json({
      success: true,
      data: { inviteCode: newInviteCode },
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, memberId } = req.params;
    const { role, isActiveResident } = req.body;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    if (!isAdminOrOwner(group, userId)) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }

    const memberIndex = group.members.findIndex((m) => m.userId === memberId);

    if (memberIndex === -1) {
      res.status(404).json({ message: "Mitglied nicht gefunden" });
      return;
    }

    const targetMember = group.members[memberIndex]!;

    // Owner-Rolle kann nicht geändert werden
    if (targetMember.role === "owner" && role) {
      res.status(400).json({ message: "Owner-Rolle kann nicht geändert werden" });
      return;
    }

    const updatedMembers = [...group.members];
    updatedMembers[memberIndex] = {
      ...targetMember,
      ...(role && { role }),
      ...(isActiveResident !== undefined && { isActiveResident }),
    };

    // ActiveResidentsCount neu berechnen
    const newActiveCount = updatedMembers.filter(
      (m) => m.isActiveResident
    ).length;

    await groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);

    res.status(200).json({
      success: true,
      data: updatedMembers[memberIndex],
    });
  } catch (error) {
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
  next: NextFunction
): Promise<void> => {
  try {
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, memberId } = req.params;

    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res.status(404).json({ message: "Gruppe nicht gefunden" });
      return;
    }

    if (!isAdminOrOwner(group, userId)) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }

    const targetMember = group.members.find((m) => m.userId === memberId);

    if (!targetMember) {
      res.status(404).json({ message: "Mitglied nicht gefunden" });
      return;
    }

    // Owner kann nicht entfernt werden
    if (targetMember.role === "owner") {
      res.status(400).json({ message: "Owner kann nicht entfernt werden" });
      return;
    }

    // Admin kann keine anderen Admins entfernen (nur Owner)
    if (
      targetMember.role === "admin" &&
      getMemberRole(group, userId) !== "owner"
    ) {
      res.status(403).json({ message: "Nur der Owner kann Admins entfernen" });
      return;
    }

    const updatedMembers = group.members.filter((m) => m.userId !== memberId);
    const newActiveCount = targetMember.isActiveResident
      ? group.activeResidentsCount - 1
      : group.activeResidentsCount;

    await groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);

    res.status(200).json({
      success: true,
      message: "Mitglied entfernt",
    });
  } catch (error) {
    next(error);
  }
};
