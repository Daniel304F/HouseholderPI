import { Response, NextFunction, Request } from "express";
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
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { toISOString } from "../helpers/index.js";

const getTaskDAO = (req: Request) =>
  req.app.locals["taskDAO"] as GenericDAO<Task>;

const getGroupDAO = (req: Request) =>
  req.app.locals["groupDAO"] as GenericDAO<Group>;

const getUserDAO = (req: Request) =>
  req.app.locals["userDAO"] as GenericDAO<User>;

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
      parentTaskId: null,
      linkedTasks: [],
      attachments: [],
      completionProof: null,
      completedAt: null,
      completedBy: null,
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

/**
 * Erstellt eine Unteraufgabe für eine bestehende Aufgabe
 * POST /api/groups/:groupId/tasks/:taskId/subtasks
 */
export const createSubtask = async (
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

    // Parent Task prüfen
    const parentTask = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);

    if (!parentTask) {
      res
        .status(404)
        .json({ success: false, message: "Parent-Aufgabe nicht gefunden" });
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

    const newSubtask = await taskDAO.create({
      groupId,
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      dueDate: new Date(dueDate),
      createdBy: userId,
      parentTaskId: taskId,
      linkedTasks: [],
      attachments: [],
      completionProof: null,
      completedAt: null,
      completedBy: null,
    } as Omit<Task, "id" | "createdAt" | "updatedAt">);

    res.status(201).json({
      success: true,
      data: toTaskResponse(newSubtask),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Holt alle Unteraufgaben einer Aufgabe
 * GET /api/groups/:groupId/tasks/:taskId/subtasks
 */
export const getSubtasks = async (
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

    const subtasks = await taskDAO.findAll({
      parentTaskId: taskId,
      groupId,
    } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: subtasks.map(toTaskResponse),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Holt eine Aufgabe mit allen Details (inkl. Subtasks und Gruppenname)
 * GET /api/groups/:groupId/tasks/:taskId/details
 */
export const getTaskWithDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userDAO = getUserDAO(req);
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

    // Subtasks holen
    const subtasks = await taskDAO.findAll({
      parentTaskId: taskId,
      groupId,
    } as Partial<Task>);

    // User-Namen holen
    let assignedToName: string | undefined;
    let createdByName: string | undefined;

    if (task.assignedTo) {
      const assignedUser = await userDAO.findOne({
        id: task.assignedTo,
      } as Partial<User>);
      assignedToName = assignedUser?.name;
    }

    const createdByUser = await userDAO.findOne({
      id: task.createdBy,
    } as Partial<User>);
    createdByName = createdByUser?.name;

    const taskWithDetails: TaskWithDetails = {
      ...toTaskResponse(task),
      subtasks: subtasks.map(toTaskResponse),
      groupName: group.name,
      assignedToName,
      createdByName,
    };

    res.status(200).json({
      success: true,
      data: taskWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verknüpft zwei Aufgaben miteinander
 * POST /api/groups/:groupId/tasks/:taskId/links
 */
export const linkTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId } = req.params;
    const { targetTaskId, linkType } = req.body;

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

    // Beide Tasks prüfen
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);
    const targetTask = await taskDAO.findOne({
      id: targetTaskId,
      groupId,
    } as Partial<Task>);

    if (!task || !targetTask) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

    if (taskId === targetTaskId) {
      res.status(400).json({
        success: false,
        message: "Eine Aufgabe kann nicht mit sich selbst verknüpft werden",
      });
      return;
    }

    // Prüfen ob Verknüpfung bereits existiert
    const existingLink = (task.linkedTasks || []).find(
      (link: TaskLink) => link.taskId === targetTaskId,
    );
    if (existingLink) {
      res
        .status(400)
        .json({ success: false, message: "Verknüpfung existiert bereits" });
      return;
    }

    // Verknüpfung hinzufügen
    const newLinkedTasks = [
      ...(task.linkedTasks || []),
      { taskId: targetTaskId, linkType },
    ];

    await taskDAO.update({
      id: taskId,
      linkedTasks: newLinkedTasks,
    } as Partial<Task>);

    // Inverse Verknüpfung beim Ziel-Task hinzufügen
    const inverseLinkType = getInverseLinkType(linkType);
    const targetLinkedTasks = [
      ...(targetTask.linkedTasks || []),
      { taskId, linkType: inverseLinkType },
    ];

    await taskDAO.update({
      id: targetTaskId,
      linkedTasks: targetLinkedTasks,
    } as Partial<Task>);

    const updatedTask = await taskDAO.findOne({ id: taskId } as Partial<Task>);

    res.status(201).json({
      success: true,
      data: updatedTask ? toTaskResponse(updatedTask) : null,
      message: "Aufgaben verknüpft",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Entfernt eine Verknüpfung zwischen zwei Aufgaben
 * DELETE /api/groups/:groupId/tasks/:taskId/links/:linkedTaskId
 */
export const unlinkTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userId = req.userId;
    const { groupId, taskId, linkedTaskId } = req.params;

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

    // Beide Tasks prüfen
    const task = await taskDAO.findOne({
      id: taskId,
      groupId,
    } as Partial<Task>);
    const linkedTask = await taskDAO.findOne({
      id: linkedTaskId,
      groupId,
    } as Partial<Task>);

    if (!task || !linkedTask) {
      res
        .status(404)
        .json({ success: false, message: "Aufgabe nicht gefunden" });
      return;
    }

    // Verknüpfung entfernen
    const newLinkedTasks = (task.linkedTasks || []).filter(
      (link: TaskLink) => link.taskId !== linkedTaskId,
    );

    await taskDAO.update({
      id: taskId,
      linkedTasks: newLinkedTasks,
    } as Partial<Task>);

    // Inverse Verknüpfung beim Ziel-Task entfernen
    const targetLinkedTasks = (linkedTask.linkedTasks || []).filter(
      (link: TaskLink) => link.taskId !== taskId,
    );

    await taskDAO.update({
      id: linkedTaskId,
      linkedTasks: targetLinkedTasks,
    } as Partial<Task>);

    const updatedTask = await taskDAO.findOne({ id: taskId } as Partial<Task>);

    res.status(200).json({
      success: true,
      data: updatedTask ? toTaskResponse(updatedTask) : null,
      message: "Verknüpfung entfernt",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Holt alle Aufgaben die dem aktuellen User zugewiesen sind
 * GET /api/tasks/my
 */
export const getMyTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskDAO = getTaskDAO(req);
    const groupDAO = getGroupDAO(req);
    const userDAO = getUserDAO(req);
    const userId = req.userId;

    // Alle Gruppen des Users holen
    const allGroups = await groupDAO.findAll({} as Partial<Group>);
    const userGroups = allGroups.filter((g) => isMemberOfGroup(g, userId));

    // Alle Tasks des Users aus allen seinen Gruppen holen
    const allTasks: TaskWithDetails[] = [];

    // Cache für User-Namen
    const userNameCache = new Map<string, string>();

    for (const group of userGroups) {
      const groupTasks = await taskDAO.findAll({
        groupId: group.id,
        assignedTo: userId,
      } as Partial<Task>);

      for (const task of groupTasks) {
        // Subtasks holen
        const subtasks = await taskDAO.findAll({
          parentTaskId: task.id,
          groupId: group.id,
        } as Partial<Task>);

        // assignedToName ermitteln
        let assignedToName: string | undefined;
        if (task.assignedTo) {
          if (userNameCache.has(task.assignedTo)) {
            assignedToName = userNameCache.get(task.assignedTo);
          } else {
            const assignedUser = await userDAO.findOne({
              id: task.assignedTo,
            } as Partial<User>);
            assignedToName =
              assignedUser?.name || assignedUser?.email || undefined;
            if (assignedToName) {
              userNameCache.set(task.assignedTo, assignedToName);
            }
          }
        }

        // createdByName ermitteln
        let createdByName: string | undefined;
        1;
        if (userNameCache.has(task.createdBy)) {
          createdByName = userNameCache.get(task.createdBy);
        } else {
          const createdUser = await userDAO.findOne({
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

    // Nach Fälligkeitsdatum sortieren
    allTasks.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

    res.status(200).json({
      success: true,
      data: allTasks,
    });
  } catch (error) {
    next(error);
  }
};

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
