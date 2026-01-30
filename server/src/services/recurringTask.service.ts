import {
  RecurringTaskTemplate,
  RecurringTaskTemplateResponse,
} from "../models/recurringTaskTemplate.js";
import { Task, TaskStatus } from "../models/task.js";
import { Group } from "../models/group.js";
import { User } from "../models/user.js";
import { GenericDAO } from "../models/generic.dao.js";
import { toISOString } from "../helpers/index.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "./errors.js";
import {
  CreateRecurringTaskInput,
  UpdateRecurringTaskInput,
} from "../schemas/recurringTask.schema.js";

const isMemberOfGroup = (group: Group, userId: string): boolean => {
  return group.members.some((m) => m.userId === userId);
};

const isAdminOfGroup = (group: Group, userId: string): boolean => {
  const member = group.members.find((m) => m.userId === userId);
  return member?.role === "owner" || member?.role === "admin";
};

export class RecurringTaskService {
  constructor(
    private recurringTaskDAO: GenericDAO<RecurringTaskTemplate>,
    private taskDAO: GenericDAO<Task>,
    private groupDAO: GenericDAO<Group>,
    _userDAO: GenericDAO<User>
  ) {}

  private async validateGroupAccess(
    groupId: string,
    userId: string
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

  private async validateAdminAccess(
    groupId: string,
    userId: string
  ): Promise<Group> {
    const group = await this.validateGroupAccess(groupId, userId);

    if (!isAdminOfGroup(group, userId)) {
      throw new ForbiddenError(
        "Nur Admins können wiederkehrende Aufgaben verwalten"
      );
    }

    return group;
  }

  async getTemplates(
    groupId: string,
    userId: string
  ): Promise<RecurringTaskTemplateResponse[]> {
    await this.validateGroupAccess(groupId, userId);

    const templates = await this.recurringTaskDAO.findAll({
      groupId,
    } as Partial<RecurringTaskTemplate>);

    return Promise.all(templates.map((t) => this.toResponse(t)));
  }

  async getTemplate(
    groupId: string,
    templateId: string,
    userId: string
  ): Promise<RecurringTaskTemplateResponse> {
    await this.validateGroupAccess(groupId, userId);

    const template = await this.recurringTaskDAO.findOne({
      id: templateId,
      groupId,
    } as Partial<RecurringTaskTemplate>);

    if (!template) {
      throw new NotFoundError("Vorlage nicht gefunden");
    }

    return this.toResponse(template);
  }

  async createTemplate(
    groupId: string,
    userId: string,
    input: CreateRecurringTaskInput
  ): Promise<RecurringTaskTemplateResponse> {
    const group = await this.validateAdminAccess(groupId, userId);

    // Validate assignee if fixed strategy
    if (input.assignmentStrategy === "fixed" && input.fixedAssignee) {
      if (!isMemberOfGroup(group, input.fixedAssignee)) {
        throw new BadRequestError("Zugewiesene Person ist kein Gruppenmitglied");
      }
    }

    // Validate rotation order if rotation strategy
    if (input.assignmentStrategy === "rotation") {
      if (!input.rotationOrder || input.rotationOrder.length === 0) {
        // Default to all group members
        input.rotationOrder = group.members.map((m) => m.userId);
      } else {
        // Validate all users in rotation are members
        for (const memberId of input.rotationOrder) {
          if (!isMemberOfGroup(group, memberId)) {
            throw new BadRequestError(
              "Alle Personen in der Rotation müssen Gruppenmitglieder sein"
            );
          }
        }
      }
    }

    const template = await this.recurringTaskDAO.create({
      groupId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      frequency: input.frequency,
      assignmentStrategy: input.assignmentStrategy,
      fixedAssignee: input.fixedAssignee,
      rotationOrder: input.rotationOrder,
      currentRotationIndex: 0,
      dueDay: input.dueDay,
      isActive: true,
      createdBy: userId,
    } as Omit<RecurringTaskTemplate, "id" | "createdAt" | "updatedAt">);

    return this.toResponse(template);
  }

  async updateTemplate(
    groupId: string,
    templateId: string,
    userId: string,
    input: UpdateRecurringTaskInput
  ): Promise<RecurringTaskTemplateResponse> {
    const group = await this.validateAdminAccess(groupId, userId);

    const template = await this.recurringTaskDAO.findOne({
      id: templateId,
      groupId,
    } as Partial<RecurringTaskTemplate>);

    if (!template) {
      throw new NotFoundError("Vorlage nicht gefunden");
    }

    // Validate assignee if changing to fixed strategy
    if (
      (input.assignmentStrategy === "fixed" || template.assignmentStrategy === "fixed") &&
      input.fixedAssignee
    ) {
      if (!isMemberOfGroup(group, input.fixedAssignee)) {
        throw new BadRequestError("Zugewiesene Person ist kein Gruppenmitglied");
      }
    }

    // Validate rotation order
    if (input.rotationOrder) {
      for (const memberId of input.rotationOrder) {
        if (!isMemberOfGroup(group, memberId)) {
          throw new BadRequestError(
            "Alle Personen in der Rotation müssen Gruppenmitglieder sein"
          );
        }
      }
    }

    const updateData: Partial<RecurringTaskTemplate> = { id: templateId };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;
    if (input.assignmentStrategy !== undefined)
      updateData.assignmentStrategy = input.assignmentStrategy;
    if (input.fixedAssignee !== undefined) {
      if (input.fixedAssignee === null || input.fixedAssignee === "") {
        // Remove fixed assignee - we'll handle this by not including it
      } else {
        updateData.fixedAssignee = input.fixedAssignee;
      }
    }
    if (input.rotationOrder !== undefined)
      updateData.rotationOrder = input.rotationOrder;
    if (input.dueDay !== undefined) updateData.dueDay = input.dueDay;

    await this.recurringTaskDAO.update(updateData);

    const updatedTemplate = await this.recurringTaskDAO.findOne({
      id: templateId,
    } as Partial<RecurringTaskTemplate>);

    return this.toResponse(updatedTemplate!);
  }

  async deleteTemplate(
    groupId: string,
    templateId: string,
    userId: string
  ): Promise<void> {
    await this.validateAdminAccess(groupId, userId);

    const template = await this.recurringTaskDAO.findOne({
      id: templateId,
      groupId,
    } as Partial<RecurringTaskTemplate>);

    if (!template) {
      throw new NotFoundError("Vorlage nicht gefunden");
    }

    await this.recurringTaskDAO.delete(templateId);
  }

  async toggleTemplate(
    groupId: string,
    templateId: string,
    userId: string
  ): Promise<RecurringTaskTemplateResponse> {
    await this.validateAdminAccess(groupId, userId);

    const template = await this.recurringTaskDAO.findOne({
      id: templateId,
      groupId,
    } as Partial<RecurringTaskTemplate>);

    if (!template) {
      throw new NotFoundError("Vorlage nicht gefunden");
    }

    await this.recurringTaskDAO.update({
      id: templateId,
      isActive: !template.isActive,
    } as Partial<RecurringTaskTemplate>);

    const updatedTemplate = await this.recurringTaskDAO.findOne({
      id: templateId,
    } as Partial<RecurringTaskTemplate>);

    return this.toResponse(updatedTemplate!);
  }

  async generateTask(
    groupId: string,
    templateId: string,
    userId: string,
    overrideAssignee?: string
  ): Promise<Task> {
    const group = await this.validateGroupAccess(groupId, userId);

    const template = await this.recurringTaskDAO.findOne({
      id: templateId,
      groupId,
    } as Partial<RecurringTaskTemplate>);

    if (!template) {
      throw new NotFoundError("Vorlage nicht gefunden");
    }

    if (!template.isActive) {
      throw new BadRequestError("Vorlage ist deaktiviert");
    }

    // Determine assignee
    let assignedTo: string | null = null;

    if (overrideAssignee) {
      if (!isMemberOfGroup(group, overrideAssignee)) {
        throw new BadRequestError("Zugewiesene Person ist kein Gruppenmitglied");
      }
      assignedTo = overrideAssignee;
    } else if (template.assignmentStrategy === "fixed") {
      assignedTo = template.fixedAssignee || null;
    } else if (
      template.assignmentStrategy === "rotation" &&
      template.rotationOrder &&
      template.rotationOrder.length > 0
    ) {
      assignedTo = template.rotationOrder[template.currentRotationIndex] ?? null;
    }

    // Calculate due date
    const dueDate = this.calculateNextDueDate(template);

    // Create the task
    const task = await this.taskDAO.create({
      groupId,
      title: template.title,
      description: template.description,
      status: "pending" as TaskStatus,
      priority: template.priority,
      assignedTo,
      dueDate,
      createdBy: userId,
      parentTaskId: null,
      linkedTasks: [],
      attachments: [],
      completionProof: null,
      completedAt: null,
      completedBy: null,
    } as Omit<Task, "id" | "createdAt" | "updatedAt">);

    // Update template: increment rotation index and set lastGeneratedAt
    const updates: Partial<RecurringTaskTemplate> = {
      id: templateId,
      lastGeneratedAt: new Date(),
    };

    if (
      template.assignmentStrategy === "rotation" &&
      template.rotationOrder &&
      template.rotationOrder.length > 0
    ) {
      updates.currentRotationIndex =
        (template.currentRotationIndex + 1) % template.rotationOrder.length;
    }

    await this.recurringTaskDAO.update(updates);

    return task;
  }

  private calculateNextDueDate(template: RecurringTaskTemplate): Date {
    const now = new Date();
    const dueDate = new Date();

    switch (template.frequency) {
      case "daily":
        dueDate.setDate(now.getDate() + 1);
        break;
      case "weekly":
        // Find next occurrence of dueDay (0=Sunday, 1=Monday, etc.)
        const currentDay = now.getDay();
        let daysUntil = template.dueDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        dueDate.setDate(now.getDate() + daysUntil);
        break;
      case "biweekly":
        const currentDayBi = now.getDay();
        let daysUntilBi = template.dueDay - currentDayBi;
        if (daysUntilBi <= 0) daysUntilBi += 14;
        dueDate.setDate(now.getDate() + daysUntilBi);
        break;
      case "monthly":
        // Set to dueDay of next month if today is past dueDay
        if (now.getDate() >= template.dueDay) {
          dueDate.setMonth(now.getMonth() + 1);
        }
        dueDate.setDate(
          Math.min(
            template.dueDay,
            new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
          )
        );
        break;
    }

    dueDate.setHours(23, 59, 59, 999);
    return dueDate;
  }

  private async toResponse(
    template: RecurringTaskTemplate
  ): Promise<RecurringTaskTemplateResponse> {
    // Calculate next suggested assignee
    let nextSuggestedAssignee: string | undefined;

    if (template.assignmentStrategy === "fixed") {
      nextSuggestedAssignee = template.fixedAssignee;
    } else if (
      template.assignmentStrategy === "rotation" &&
      template.rotationOrder &&
      template.rotationOrder.length > 0
    ) {
      nextSuggestedAssignee =
        template.rotationOrder[template.currentRotationIndex];
    }

    const response: RecurringTaskTemplateResponse = {
      id: template.id,
      groupId: template.groupId,
      title: template.title,
      priority: template.priority,
      frequency: template.frequency,
      assignmentStrategy: template.assignmentStrategy,
      currentRotationIndex: template.currentRotationIndex,
      dueDay: template.dueDay,
      isActive: template.isActive,
      createdBy: template.createdBy,
      createdAt: toISOString(template.createdAt),
      updatedAt: toISOString(template.updatedAt),
    };

    if (template.description) {
      response.description = template.description;
    }
    if (template.fixedAssignee) {
      response.fixedAssignee = template.fixedAssignee;
    }
    if (template.rotationOrder) {
      response.rotationOrder = template.rotationOrder;
    }
    if (template.lastGeneratedAt) {
      response.lastGeneratedAt = toISOString(template.lastGeneratedAt);
    }
    if (nextSuggestedAssignee) {
      response.nextSuggestedAssignee = nextSuggestedAssignee;
    }

    return response;
  }
}
