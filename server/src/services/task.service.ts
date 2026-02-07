import {
  Task,
  TaskResponse,
  TaskWithDetails,
  TaskLink,
  TaskAttachment,
} from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { toISOString } from "../helpers/index.js";
import {
  BadRequestError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "./errors.js";

// Hilfsfunktion: Prüfen ob User Mitglied einer Gruppe ist
const isMemberOfGroup = (group: Group, userId: string): boolean => {
  return group.members.some((m) => m.userId === userId);
};

// Hilfsfunktion: Task in Response-Format umwandeln
const toTaskResponse = (task: Task): TaskResponse => ({
  id: task.id,
  groupId: task.groupId,
  title: task.title,
  ...(task.description !== undefined && { description: task.description }),
  status: task.status,
  priority: task.priority,
  assignedTo: task.assignedTo,
  dueDate: toISOString(task.dueDate),
  createdBy: task.createdBy,
  createdAt: toISOString(task.createdAt),
  updatedAt: toISOString(task.updatedAt),
  parentTaskId: task.parentTaskId || null,
  linkedTasks: task.linkedTasks || [],
  attachments: (task.attachments || []).map((a: TaskAttachment) => ({
    ...a,
    uploadedAt: toISOString(a.uploadedAt),
    url: `/uploads/${a.filename}`,
  })),
  completionProof: task.completionProof
    ? {
        ...task.completionProof,
        uploadedAt: toISOString(task.completionProof.uploadedAt),
        url: `/uploads/${task.completionProof.filename}`,
      }
    : null,
  completedAt: task.completedAt ? toISOString(task.completedAt) : null,
  completedBy: task.completedBy || null,
  ...(task.archived && { archived: true }),
});

// Hilfsfunktion: Inverse Link-Typen ermitteln
const getInverseLinkType = (linkType: string): string => {
  const inverseTypes: Record<string, string> = {
    blocks: "blocked-by",
    "blocked-by": "blocks",
    "relates-to": "relates-to",
    duplicates: "duplicated-by",
    "duplicated-by": "duplicates",
  };
  return inverseTypes[linkType] || "relates-to";
};

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  dueDate?: string;
}

export class TaskService {
  constructor(
    private taskDAO: GenericDAO<Task>,
    private groupDAO: GenericDAO<Group>,
    private userDAO: GenericDAO<User>,
  ) {}

  /**
   * Validiert Gruppenzugriff und gibt die Gruppe zurück
   */
  private async validateGroupAccess(
    groupId: string,
    userId: string,
  ): Promise<Group> {
    const group = await this.groupDAO.findOne({
      id: groupId,
    } as Partial<Group>);

    if (!group) {
      throw new NotFoundError("Gruppe nicht gefunden");
    }

    if (!isMemberOfGroup(group, userId)) {
      throw new ForbiddenError("Kein Zugriff auf diese Gruppe");
    }

    return group;
  }

  /**
   * Validiert, dass ein assignedTo-User Mitglied der Gruppe ist
   */
  private validateAssignee(
    group: Group,
    assignedTo: string | null | undefined,
  ): void {
    if (assignedTo && !isMemberOfGroup(group, assignedTo)) {
      throw new BadRequestError(
        "Die zugewiesene Person ist kein Mitglied der Gruppe",
      );
    }
  }

  async createTask(
    groupId: string,
    userId: string,
    input: CreateTaskInput,
  ): Promise<TaskResponse> {
    const group = await this.validateGroupAccess(groupId, userId);
    this.validateAssignee(group, input.assignedTo);

    const newTask = await this.taskDAO.create({
      groupId,
      title: input.title,
      description: input.description,
      status: input.status || "pending",
      priority: input.priority || "medium",
      assignedTo: input.assignedTo || null,
      dueDate: new Date(input.dueDate),
      createdBy: userId,
      parentTaskId: null,
      linkedTasks: [],
      attachments: [],
      completionProof: null,
      completedAt: null,
      completedBy: null,
    } as Omit<Task, "id" | "createdAt" | "updatedAt">);

    return toTaskResponse(newTask);
  }

  async getGroupTasks(
    groupId: string,
    userId: string,
  ): Promise<TaskResponse[]> {
    await this.validateGroupAccess(groupId, userId);

    const tasks = await this.taskDAO.findAll({ groupId } as Partial<Task>);
    return tasks.filter((t) => !t.archived).map(toTaskResponse);
  }

  async getTask(
    groupId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskResponse> {
    await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    return toTaskResponse(task);
  }

  async updateTask(
    groupId: string,
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<TaskResponse> {
    const group = await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    if (input.assignedTo !== undefined && input.assignedTo !== null) {
      this.validateAssignee(group, input.assignedTo);
    }

    const updated = await this.taskDAO.update({
      id: taskId,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
      ...(input.dueDate !== undefined && { dueDate: new Date(input.dueDate) }),
    } as Partial<Task>);

    if (!updated) {
      throw new InternalError("Aktualisierung fehlgeschlagen");
    }

    const updatedTask = await this.taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);
    return toTaskResponse(updatedTask!);
  }

  async deleteTask(
    groupId: string,
    taskId: string,
    userId: string,
  ): Promise<void> {
    await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    await this.taskDAO.delete(task.id);
  }

  async assignTask(
    groupId: string,
    taskId: string,
    userId: string,
    assignedTo: string | null,
  ): Promise<{ task: TaskResponse; message: string }> {
    const group = await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    if (assignedTo !== null) {
      this.validateAssignee(group, assignedTo);
    }

    const updated = await this.taskDAO.update({
      id: taskId,
      assignedTo,
    } as Partial<Task>);

    if (!updated) {
      throw new InternalError("Zuweisung fehlgeschlagen");
    }

    const updatedTask = await this.taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);
    return {
      task: toTaskResponse(updatedTask!),
      message: assignedTo ? "Aufgabe zugewiesen" : "Zuweisung entfernt",
    };
  }

  async createSubtask(
    groupId: string,
    parentTaskId: string,
    userId: string,
    input: CreateTaskInput,
  ): Promise<TaskResponse> {
    const group = await this.validateGroupAccess(groupId, userId);

    const parentTask = await this.taskDAO.findOne({
      id: parentTaskId,
      groupId,
    } as Partial<Task>);

    if (!parentTask) {
      throw new NotFoundError("Parent-Aufgabe nicht gefunden");
    }

    this.validateAssignee(group, input.assignedTo);

    const newSubtask = await this.taskDAO.create({
      groupId,
      title: input.title,
      description: input.description,
      status: input.status || "pending",
      priority: input.priority || "medium",
      assignedTo: input.assignedTo || null,
      dueDate: new Date(input.dueDate),
      createdBy: userId,
      parentTaskId,
      linkedTasks: [],
      attachments: [],
      completionProof: null,
      completedAt: null,
      completedBy: null,
    } as Omit<Task, "id" | "createdAt" | "updatedAt">);

    return toTaskResponse(newSubtask);
  }

  async getSubtasks(
    groupId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskResponse[]> {
    await this.validateGroupAccess(groupId, userId);

    const subtasks = await this.taskDAO.findAll({
      parentTaskId: taskId,
      groupId,
    } as Partial<Task>);

    return subtasks.map(toTaskResponse);
  }

  async getTaskWithDetails(
    groupId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskWithDetails> {
    const group = await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!task) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    const subtasks = await this.taskDAO.findAll({
      parentTaskId: taskId,
      groupId,
    } as Partial<Task>);

    let assignedToName: string | undefined;
    let createdByName: string | undefined;

    if (task.assignedTo) {
      const assignedUser = await this.userDAO.findOne({
        id: task.assignedTo,
      } as Partial<User>);
      assignedToName = assignedUser?.name;
    }

    const createdByUser = await this.userDAO.findOne({
      id: task.createdBy,
    } as Partial<User>);
    createdByName = createdByUser?.name;

    return {
      ...toTaskResponse(task),
      subtasks: subtasks.map(toTaskResponse),
      groupName: group.name,
      assignedToName,
      createdByName,
    };
  }

  async linkTasks(
    groupId: string,
    taskId: string,
    targetTaskId: string,
    linkType: string,
    userId: string,
  ): Promise<{ task: TaskResponse; message: string }> {
    await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    const targetTask = await this.taskDAO.findOne({
      id: targetTaskId,
      groupId,
    } as Partial<Task>);

    if (!task || !targetTask) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    if (taskId === targetTaskId) {
      throw new BadRequestError(
        "Eine Aufgabe kann nicht mit sich selbst verknüpft werden",
      );
    }

    const existingLink = (task.linkedTasks || []).find(
      (link: TaskLink) => link.taskId === targetTaskId,
    );
    if (existingLink) {
      throw new BadRequestError("Verknüpfung existiert bereits");
    }

    const newLinkedTasks = [
      ...(task.linkedTasks || []),
      { taskId: targetTaskId, linkType },
    ];

    await this.taskDAO.update({
      id: taskId,
      linkedTasks: newLinkedTasks,
    } as Partial<Task>);

    const inverseLinkType = getInverseLinkType(linkType);
    const targetLinkedTasks = [
      ...(targetTask.linkedTasks || []),
      { taskId, linkType: inverseLinkType },
    ];

    await this.taskDAO.update({
      id: targetTaskId,
      linkedTasks: targetLinkedTasks,
    } as Partial<Task>);

    const updatedTask = await this.taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);

    return {
      task: toTaskResponse(updatedTask!),
      message: "Aufgaben verknüpft",
    };
  }

  async unlinkTasks(
    groupId: string,
    taskId: string,
    linkedTaskId: string,
    userId: string,
  ): Promise<{ task: TaskResponse; message: string }> {
    await this.validateGroupAccess(groupId, userId);

    const task = await this.taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    const linkedTask = await this.taskDAO.findOne({
      id: linkedTaskId,
      groupId,
    } as Partial<Task>);

    if (!task || !linkedTask) {
      throw new NotFoundError("Aufgabe nicht gefunden");
    }

    const newLinkedTasks = (task.linkedTasks || []).filter(
      (link: TaskLink) => link.taskId !== linkedTaskId,
    );

    await this.taskDAO.update({
      id: taskId,
      linkedTasks: newLinkedTasks,
    } as Partial<Task>);

    const targetLinkedTasks = (linkedTask.linkedTasks || []).filter(
      (link: TaskLink) => link.taskId !== taskId,
    );

    await this.taskDAO.update({
      id: linkedTaskId,
      linkedTasks: targetLinkedTasks,
    } as Partial<Task>);

    const updatedTask = await this.taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);

    return {
      task: toTaskResponse(updatedTask!),
      message: "Verknüpfung entfernt",
    };
  }

  async getArchivedTasks(
    groupId: string,
    userId: string,
  ): Promise<TaskResponse[]> {
    await this.validateGroupAccess(groupId, userId);

    const tasks = await this.taskDAO.findAll({ groupId } as Partial<Task>);
    return tasks.filter((t) => t.archived).map(toTaskResponse);
  }

  async archiveCompletedTasks(
    groupId: string,
    userId: string,
  ): Promise<{ archivedCount: number }> {
    await this.validateGroupAccess(groupId, userId);

    const tasks = await this.taskDAO.findAll({ groupId } as Partial<Task>);
    const completedTasks = tasks.filter(
      (t) => t.status === "completed" && !t.archived,
    );

    for (const task of completedTasks) {
      await this.taskDAO.update({
        id: task.id,
        archived: true,
      } as Partial<Task>);
    }

    return { archivedCount: completedTasks.length };
  }

  async getMyTasks(userId: string): Promise<TaskWithDetails[]> {
    const allGroups = await this.groupDAO.findAll({} as Partial<Group>);
    const userGroups = allGroups.filter((g) => isMemberOfGroup(g, userId));

    const allTasks: TaskWithDetails[] = [];
    const userNameCache = new Map<string, string>();

    for (const group of userGroups) {
      const groupTasks = await this.taskDAO.findAll({
        groupId: group.id,
        assignedTo: userId,
      } as Partial<Task>);

      for (const task of groupTasks) {
        const subtasks = await this.taskDAO.findAll({
          parentTaskId: task.id,
          groupId: group.id,
        } as Partial<Task>);

        let assignedToName: string | undefined;
        if (task.assignedTo) {
          if (userNameCache.has(task.assignedTo)) {
            assignedToName = userNameCache.get(task.assignedTo);
          } else {
            const assignedUser = await this.userDAO.findOne({
              id: task.assignedTo,
            } as Partial<User>);
            assignedToName =
              assignedUser?.name || assignedUser?.email || undefined;
            if (assignedToName) {
              userNameCache.set(task.assignedTo, assignedToName);
            }
          }
        }

        let createdByName: string | undefined;
        if (userNameCache.has(task.createdBy)) {
          createdByName = userNameCache.get(task.createdBy);
        } else {
          const createdUser = await this.userDAO.findOne({
            id: task.createdBy,
          } as Partial<User>);
          createdByName = createdUser?.name || createdUser?.email || undefined;
          if (createdByName) {
            userNameCache.set(task.createdBy, createdByName);
          }
        }

        allTasks.push({
          ...toTaskResponse(task),
          subtasks: subtasks.map(toTaskResponse),
          groupName: group.name,
          assignedToName,
          createdByName,
        });
      }
    }

    allTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

    return allTasks;
  }
}
