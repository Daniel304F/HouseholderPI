import { v4 as uuidv4 } from "uuid";
import {
  Comment,
  CommentWithUser,
  CommentResponse,
} from "../models/comment.js";
import { Group } from "../models/group.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import {
  NotFoundError,
  ForbiddenError,
  InternalError,
} from "./errors.js";

export class CommentService {
  constructor(
    private commentDAO: GenericDAO<Comment>,
    private taskDAO: GenericDAO<Task>,
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>
  ) {}

  private async verifyGroupMembership(
    groupId: string,
    userId: string
  ): Promise<Group> {
    const group = await this.groupDAO.findOne({ id: groupId } as Partial<Group>);
    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenError("Kein Mitglied dieser Gruppe");
    }

    return group;
  }

  private async verifyTaskExists(
    taskId: string,
    groupId: string
  ): Promise<Task> {
    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);
    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }
    return task;
  }

  private toResponse(comment: CommentWithUser): CommentResponse {
    return {
      id: comment.id,
      taskId: comment.taskId,
      groupId: comment.groupId,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      editedAt: comment.editedAt ? comment.editedAt.toISOString() : null,
    };
  }

  async createComment(
    groupId: string,
    taskId: string,
    userId: string,
    content: string
  ): Promise<CommentResponse> {
    await this.verifyGroupMembership(groupId, userId);
    await this.verifyTaskExists(taskId, groupId);

    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);
    if (!user) {
      throw new NotFoundError("Benutzer nicht gefunden");
    }

    const now = new Date();
    const comment: Comment = {
      id: uuidv4(),
      taskId,
      groupId,
      userId,
      content,
      editedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.commentDAO.create(comment);

    const commentWithUser: CommentWithUser = {
      ...comment,
      userName: user.name,
      userAvatar: user.avatar,
    };

    return this.toResponse(commentWithUser);
  }

  async getComments(
    groupId: string,
    taskId: string,
    userId: string
  ): Promise<CommentResponse[]> {
    await this.verifyGroupMembership(groupId, userId);
    await this.verifyTaskExists(taskId, groupId);

    const comments = await this.commentDAO.findAll({
      taskId,
      groupId,
    } as Partial<Comment>);

    // Sort by createdAt ascending (oldest first)
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Enrich with user info
    const enrichedComments: CommentResponse[] = [];
    for (const comment of comments) {
      const user = await this.userDAO.findOne({
        id: comment.userId,
      } as Partial<User>);

      const commentWithUser: CommentWithUser = {
        ...comment,
        userName: user?.name || "Unbekannt",
        userAvatar: user?.avatar,
      };

      enrichedComments.push(this.toResponse(commentWithUser));
    }

    return enrichedComments;
  }

  async updateComment(
    groupId: string,
    taskId: string,
    commentId: string,
    userId: string,
    content: string
  ): Promise<CommentResponse> {
    await this.verifyGroupMembership(groupId, userId);
    await this.verifyTaskExists(taskId, groupId);

    const comment = await this.commentDAO.findOne({
      id: commentId,
      taskId,
      groupId,
    } as Partial<Comment>);

    if (!comment) {
      throw new NotFoundError("Kommentar nicht gefunden");
    }

    if (comment.userId !== userId) {
      throw new ForbiddenError("Nur der Autor kann den Kommentar bearbeiten");
    }

    const now = new Date();
    const updated = await this.commentDAO.update({
      id: commentId,
      content,
      editedAt: now,
      updatedAt: now,
    } as Partial<Comment>);

    if (!updated) {
      throw new InternalError("Kommentar konnte nicht aktualisiert werden");
    }

    // Fetch updated comment
    const updatedComment = await this.commentDAO.findOne({
      id: commentId,
    } as Partial<Comment>);

    if (!updatedComment) {
      throw new InternalError("Kommentar konnte nicht gefunden werden");
    }

    const user = await this.userDAO.findOne({ id: userId } as Partial<User>);

    const commentWithUser: CommentWithUser = {
      ...updatedComment,
      userName: user?.name || "Unbekannt",
      userAvatar: user?.avatar,
    };

    return this.toResponse(commentWithUser);
  }

  async deleteComment(
    groupId: string,
    taskId: string,
    commentId: string,
    userId: string
  ): Promise<void> {
    const group = await this.verifyGroupMembership(groupId, userId);
    await this.verifyTaskExists(taskId, groupId);

    const comment = await this.commentDAO.findOne({
      id: commentId,
      taskId,
      groupId,
    } as Partial<Comment>);

    if (!comment) {
      throw new NotFoundError("Kommentar nicht gefunden");
    }

    // Allow deletion by comment author or group admins/owners
    const member = group.members.find((m) => m.userId === userId);
    const isAdminOrOwner =
      member?.role === "admin" || member?.role === "owner";
    const isAuthor = comment.userId === userId;

    if (!isAuthor && !isAdminOrOwner) {
      throw new ForbiddenError(
        "Nur der Autor oder Gruppenadmins können den Kommentar löschen"
      );
    }

    const deleted = await this.commentDAO.delete(commentId);
    if (!deleted) {
      throw new InternalError("Kommentar konnte nicht gelöscht werden");
    }
  }

  async getCommentCount(taskId: string): Promise<number> {
    const comments = await this.commentDAO.findAll({
      taskId,
    } as Partial<Comment>);
    return comments.length;
  }
}
