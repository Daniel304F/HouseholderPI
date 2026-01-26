import { Response, NextFunction, Request } from "express";
import { Task, TaskResponse } from "../models/task.js";
import { Group } from "../models/group.js";
import { GenericDAO } from "../models/generic.dao.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { toISOString } from "../helpers/index.js";

const getTaskDAO = (req: Request) =>
  req.app.locals["taskDAO"] as GenericDAO<Task>;

const getGroupDAO = (req: Request) =>
  req.app.locals["groupDAO"] as GenericDAO<Group>;

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
});

/**
 * Erstellt eine neue Aufgabe in einer Gruppe
 * POST /api/groups/:groupId/tasks
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

    // Falls assignedTo gesetzt ist, prüfen ob die Person Mitglied der Gruppe ist
    if (assignedTo && !isMemberOfGroup(group, assignedTo)) {
      res.status(400).json({
        success: false,
        message: "Die zugewiesene Person ist kein Mitglied der Gruppe",
      });
      return;
    }

    const newTask = await taskDAO.create({
      groupId,
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      dueDate: new Date(dueDate),
      createdBy: userId,
    } as Omit<Task, "id" | "createdAt" | "updatedAt">);

    res.status(201).json({
      success: true,
      data: toTaskResponse(newTask),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Holt alle Aufgaben einer Gruppe
 * GET /api/groups/:groupId/tasks
 */
export const getGroupTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId } = req.params;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

    const tasks = await taskDAO.findAll({ groupId } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: tasks.map(toTaskResponse),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Holt eine spezifische Aufgabe
 * GET /api/groups/:groupId/tasks/:taskId
 */
export const getTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

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

    res.status(200).json({
      success: true,
      data: toTaskResponse(task),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aktualisiert eine Aufgabe
 * PATCH /api/groups/:groupId/tasks/:taskId
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

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

    // Falls assignedTo geändert wird, prüfen ob die Person Mitglied der Gruppe ist
    if (assignedTo !== undefined && assignedTo !== null) {
      if (!isMemberOfGroup(group, assignedTo)) {
        res.status(400).json({
          success: false,
          message: "Die zugewiesene Person ist kein Mitglied der Gruppe",
        });
        return;
      }
    }

    const updated = await taskDAO.update({
      id: taskId,
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
    } as Partial<Task>);

    if (!updated) {
      res
        .status(500)
        .json({ success: false, message: "Aktualisierung fehlgeschlagen" });
      return;
    }

    const updatedTask = await taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: updatedTask ? toTaskResponse(updatedTask) : null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Löscht eine Aufgabe
 * DELETE /api/groups/:groupId/tasks/:taskId
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

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

    await taskDAO.delete(task.id);

    res.status(200).json({
      success: true,
      message: "Aufgabe gelöscht",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Weist eine Aufgabe einem User zu
 * PATCH /api/groups/:groupId/tasks/:taskId/assign
 */
export const assignTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;
    const { assignedTo } = req.body;

    // Gruppe prüfen
    const group = await groupDAO.findOne({ id: groupId } as Partial<Group>);

    if (!group) {
      res
        .status(404)
        .json({ success: false, message: "Gruppe nicht gefunden" });
      return;
    }

    // Prüfen ob User Mitglied ist
    if (!isMemberOfGroup(group, userId)) {
      res
        .status(403)
        .json({ success: false, message: "Kein Zugriff auf diese Gruppe" });
      return;
    }

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

    // Falls assignedTo gesetzt ist, prüfen ob die Person Mitglied der Gruppe ist
    if (assignedTo !== null && !isMemberOfGroup(group, assignedTo)) {
      res.status(400).json({
        success: false,
        message: "Die zugewiesene Person ist kein Mitglied der Gruppe",
      });
      return;
    }

    const updated = await taskDAO.update({
      id: taskId,
      assignedTo,
    } as Partial<Task>);

    if (!updated) {
      res
        .status(500)
        .json({ success: false, message: "Zuweisung fehlgeschlagen" });
      return;
    }

    const updatedTask = await taskDAO.findOne({
      id: taskId,
    } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: updatedTask ? toTaskResponse(updatedTask) : null,
      message: assignedTo ? "Aufgabe zugewiesen" : "Zuweisung entfernt",
    });
  } catch (error) {
    next(error);
  }
};
