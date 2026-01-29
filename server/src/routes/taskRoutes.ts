import { Router, RequestHandler } from "express";
import * as taskController from "../controllers/taskController.js";
import * as uploadController from "../controllers/uploadController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  uploadAttachment,
  uploadCompletionProof,
} from "../config/upload.config.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  groupTasksParamSchema,
  assignTaskSchema,
  createSubtaskSchema,
  linkTaskSchema,
  unlinkTaskSchema,
} from "../schemas/task.schema.js";

const router = Router({ mergeParams: true });

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Aufgaben CRUD
router.post(
  "/",
  validateResource(createTaskSchema),
  taskController.createTask as RequestHandler,
);

router.get(
  "/",
  validateResource(groupTasksParamSchema),
  taskController.getGroupTasks as RequestHandler,
);

router.get(
  "/:taskId",
  validateResource(taskIdParamSchema),
  taskController.getTask as RequestHandler,
);

// Task Details mit Subtasks
router.get(
  "/:taskId/details",
  validateResource(taskIdParamSchema),
  taskController.getTaskWithDetails as RequestHandler,
);

router.patch(
  "/:taskId",
  validateResource(updateTaskSchema),
  taskController.updateTask as RequestHandler,
);

router.delete(
  "/:taskId",
  validateResource(taskIdParamSchema),
  taskController.deleteTask as RequestHandler,
);

// Aufgabe zuweisen
router.patch(
  "/:taskId/assign",
  validateResource(assignTaskSchema),
  taskController.assignTask as RequestHandler,
);

// Subtasks
router.post(
  "/:taskId/subtasks",
  validateResource(createSubtaskSchema),
  taskController.createSubtask as RequestHandler,
);

router.get(
  "/:taskId/subtasks",
  validateResource(taskIdParamSchema),
  taskController.getSubtasks as RequestHandler,
);

// Task Linking
router.post(
  "/:taskId/links",
  validateResource(linkTaskSchema),
  taskController.linkTasks as RequestHandler,
);

router.delete(
  "/:taskId/links/:linkedTaskId",
  validateResource(unlinkTaskSchema),
  taskController.unlinkTasks as RequestHandler,
);

// Attachments
router.get(
  "/:taskId/attachments",
  validateResource(taskIdParamSchema),
  uploadController.getAttachments as RequestHandler,
);

router.post(
  "/:taskId/attachments",
  uploadAttachment.single("file"),
  uploadController.uploadAttachment as RequestHandler,
);

router.delete(
  "/:taskId/attachments/:attachmentId",
  uploadController.deleteAttachment as RequestHandler,
);

// Complete task with optional proof photo
router.post(
  "/:taskId/complete",
  uploadCompletionProof.single("proof"),
  uploadController.completeTaskWithProof as RequestHandler,
);

export default router;
