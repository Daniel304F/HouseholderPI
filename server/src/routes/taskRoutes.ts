import { Router, RequestHandler } from "express";
import * as taskController from "../controllers/taskController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  groupTasksParamSchema,
  assignTaskSchema,
} from "../schemas/task.schema.js";

const router = Router({ mergeParams: true });

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Aufgaben CRUD
router.post(
  "/",
  validateResource(createTaskSchema),
  taskController.createTask as RequestHandler
);

router.get(
  "/",
  validateResource(groupTasksParamSchema),
  taskController.getGroupTasks as RequestHandler
);

router.get(
  "/:taskId",
  validateResource(taskIdParamSchema),
  taskController.getTask as RequestHandler
);

router.patch(
  "/:taskId",
  validateResource(updateTaskSchema),
  taskController.updateTask as RequestHandler
);

router.delete(
  "/:taskId",
  validateResource(taskIdParamSchema),
  taskController.deleteTask as RequestHandler
);

// Aufgabe zuweisen
router.patch(
  "/:taskId/assign",
  validateResource(assignTaskSchema),
  taskController.assignTask as RequestHandler
);

export default router;
