import crypto from "crypto";
import {
  Group,
  GroupListItem,
  GroupMember,
  GroupMemberWithUser,
} from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "./errors.js";

// Hilfsfunktion: Member mit User-Info anreichern
const enrichMembersWithUserInfo = async (
  members: GroupMember[],
  userDAO: GenericDAO<User>,
): Promise<GroupMemberWithUser[]> => {
  const userIds = members.map((m) => m.userId);
  const users = await Promise.all(
    userIds.map((id) => userDAO.findOne({ id } as Partial<User>)),
  );

  return members.map((member, index) => {
    const user = users[index];
    const result: GroupMemberWithUser = {
      ...member,
      userName: user?.name ?? "Unbekannt",
    };
    if (user?.avatar) {
      result.userAvatar = user.avatar;
    }
    return result;
  });
};

// Hilfsfunktion: Invite-Code generieren
const generateInviteCode = (): string => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Hilfsfunktion: Prüfen ob User Mitglied einer Gruppe ist
const getMemberRole = (
  group: Group,
  userId: string,
): GroupMember["role"] | null => {
  const member = group.members.find((m) => m.userId === userId);
  return member?.role ?? null;
};

// Hilfsfunktion: Prüfen ob User Admin/Owner ist
const isAdminOrOwner = (group: Group, userId: string): boolean => {
  const role = getMemberRole(group, userId);
  return role === "owner" || role === "admin";
};

export interface GroupWithMembers extends Group {
  members: GroupMemberWithUser[];
}

export interface UpdateGroupInput {
  name?: string;
  picture?: string;
}

export interface UpdateMemberInput {
  role?: GroupMember["role"];
  isActiveResident?: boolean;
}

export class GroupService {
  constructor(
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>,
  ) {}

  async createGroup(
    userId: string,
    name: string,
    picture?: string,
  ): Promise<Group> {
    const newGroup = await this.groupDAO.create({
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

    return newGroup;
  }

  async getMyGroups(userId: string): Promise<GroupListItem[]> {
    const allGroups = await this.groupDAO.findAll();

    return allGroups
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
  }

  async getGroup(groupId: string, userId: string): Promise<GroupWithMembers> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!getMemberRole(group, userId)) {
      throw new ForbiddenError("Kein Zugriff auf diese Gruppe");
    }

    const membersWithUserInfo = await enrichMembersWithUserInfo(
      group.members,
      this.userDAO,
    );

    return {
      ...group,
      members: membersWithUserInfo,
    };
  }

  async updateGroup(
    groupId: string,
    userId: string,
    input: UpdateGroupInput,
  ): Promise<Group> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isAdminOrOwner(group, userId)) {
      throw new ForbiddenError("Keine Berechtigung");
    }

    const updated = await this.groupDAO.update({
      id: groupId,
      ...(input.name && { name: input.name }),
      ...(input.picture !== undefined && { picture: input.picture }),
    } as Partial<Group>);

    if (!updated) {
      throw new InternalError("Aktualisierung fehlgeschlagen");
    }

    const updatedGroup = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    return updatedGroup!;
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (getMemberRole(group, userId) !== "owner") {
      throw new ForbiddenError("Nur der Owner kann die Gruppe löschen");
    }

    await this.groupDAO.delete(groupId);
  }

  async joinGroup(
    inviteCode: string,
    userId: string,
  ): Promise<{ group: Group; message: string }> {
    const group = await this.groupDAO.findOne({
      inviteCode,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Ungültiger Invite-Code");
    }

    if (getMemberRole(group, userId)) {
      throw new ConflictError("Du bist bereits Mitglied dieser Gruppe");
    }

    const newMember: GroupMember = {
      userId,
      role: "member",
      isActiveResident: false,
      joinedAt: new Date(),
    };

    const updated = await this.groupDAO.update({
      id: group.id,
      members: [...group.members, newMember],
    } as Partial<Group>);

    if (!updated) {
      throw new InternalError("Beitritt fehlgeschlagen");
    }

    const updatedGroup = await this.groupDAO.findOne({
      id: group.id,
    } as Partial<Group>);

    return {
      group: updatedGroup!,
      message: "Erfolgreich beigetreten",
    };
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    const memberRole = getMemberRole(group, userId);

    if (!memberRole) {
      throw new ForbiddenError("Du bist kein Mitglied dieser Gruppe");
    }

    if (memberRole === "owner") {
      throw new BadRequestError(
        "Als Owner musst du die Gruppe löschen oder einen anderen Owner bestimmen",
      );
    }

    const member = group.members.find((m) => m.userId === userId)!;
    const updatedMembers = group.members.filter((m) => m.userId !== userId);
    const newActiveCount = member.isActiveResident
      ? group.activeResidentsCount - 1
      : group.activeResidentsCount;

    await this.groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);
  }

  async regenerateInviteCode(groupId: string, userId: string): Promise<string> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isAdminOrOwner(group, userId)) {
      throw new ForbiddenError("Keine Berechtigung");
    }

    const newInviteCode = generateInviteCode();

    await this.groupDAO.update({
      id: groupId,
      inviteCode: newInviteCode,
    } as Partial<Group>);

    return newInviteCode;
  }

  async updateMember(
    groupId: string,
    memberId: string,
    userId: string,
    input: UpdateMemberInput,
  ): Promise<GroupMember> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isAdminOrOwner(group, userId)) {
      throw new ForbiddenError("Keine Berechtigung");
    }

    const memberIndex = group.members.findIndex((m) => m.userId === memberId);

    if (memberIndex === -1) {
      throw new NotFoundError("Mitglied nicht gefunden");
    }

    const targetMember = group.members[memberIndex]!;

    if (targetMember.role === "owner" && input.role) {
      throw new BadRequestError("Owner-Rolle kann nicht geändert werden");
    }

    const updatedMembers = [...group.members];
    updatedMembers[memberIndex] = {
      ...targetMember,
      ...(input.role && { role: input.role }),
      ...(input.isActiveResident !== undefined && {
        isActiveResident: input.isActiveResident,
      }),
    };

    const newActiveCount = updatedMembers.filter(
      (m) => m.isActiveResident,
    ).length;

    await this.groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);

    return updatedMembers[memberIndex]!;
  }

  async removeMember(
    groupId: string,
    memberId: string,
    userId: string,
  ): Promise<void> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isAdminOrOwner(group, userId)) {
      throw new ForbiddenError("Keine Berechtigung");
    }

    const targetMember = group.members.find((m) => m.userId === memberId);

    if (!targetMember) {
      throw new NotFoundError("Mitglied nicht gefunden");
    }

    if (targetMember.role === "owner") {
      throw new BadRequestError("Owner kann nicht entfernt werden");
    }

    if (
      targetMember.role === "admin" &&
      getMemberRole(group, userId) !== "owner"
    ) {
      throw new ForbiddenError("Nur der Owner kann Admins entfernen");
    }

    const updatedMembers = group.members.filter((m) => m.userId !== memberId);
    const newActiveCount = targetMember.isActiveResident
      ? group.activeResidentsCount - 1
      : group.activeResidentsCount;

    await this.groupDAO.update({
      id: groupId,
      members: updatedMembers,
      activeResidentsCount: newActiveCount,
    } as Partial<Group>);
  }
}
