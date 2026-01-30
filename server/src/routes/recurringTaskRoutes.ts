import { Router, RequestHandler } from "express";
import * as recurringTaskController from "../controllers/recurringTaskController.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  createRecurringTaskSchema,
  updateRecurringTaskSchema,
  recurringTaskIdSchema,
  generateTaskSchema,
} from "../schemas/recurringTask.schema.js";

const router = Router({ mergeParams: true });

// Get all recurring task templates for a group
router.get("/", recurringTaskController.getTemplates as RequestHandler);

// Get a specific template
router.get(
  "/:id",
  validateResource(recurringTaskIdSchema),
  recurringTaskController.getTemplate as RequestHandler
);

// Create a new template
router.post(
  "/",
  validateResource(createRecurringTaskSchema),
  recurringTaskController.createTemplate as RequestHandler
);

// Update a template
router.patch(
  "/:id",
  validateResource(updateRecurringTaskSchema),
  recurringTaskController.updateTemplate as RequestHandler
);

// Delete a template
router.delete(
  "/:id",
  validateResource(recurringTaskIdSchema),
  recurringTaskController.deleteTemplate as RequestHandler
);

// Toggle active status
router.post(
  "/:id/toggle",
  validateResource(recurringTaskIdSchema),
  recurringTaskController.toggleTemplate as RequestHandler
);

// Generate a task from template
router.post(
  "/:id/generate",
  validateResource(generateTaskSchema),
  recurringTaskController.generateTask as RequestHandler
);

export default router;
