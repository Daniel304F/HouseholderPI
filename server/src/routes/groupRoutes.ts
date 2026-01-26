import { Router, RequestHandler } from "express";
import * as groupController from "../controllers/groupController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  createGroupSchema,
  updateGroupSchema,
  joinGroupSchema,
  groupIdParamSchema,
  updateMemberSchema,
  removeMemberSchema,
} from "../schemas/group.schema.js";
import taskRoutes from "./taskRoutes.js";

const router = Router();

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Gruppen CRUD
router.post(
  "/",
  validateResource(createGroupSchema),
  groupController.createGroup as RequestHandler,
);

router.get("/", groupController.getMyGroups as RequestHandler);

router.get(
  "/:groupId",
  validateResource(groupIdParamSchema),
  groupController.getGroup as RequestHandler,
);

router.patch(
  "/:groupId",
  validateResource(updateGroupSchema),
  groupController.updateGroup as RequestHandler,
);

router.delete(
  "/:groupId",
  validateResource(groupIdParamSchema),
  groupController.deleteGroup as RequestHandler,
);

// Gruppe beitreten/verlassen
router.post(
  "/join",
  validateResource(joinGroupSchema),
  groupController.joinGroup as RequestHandler,
);

router.post(
  "/:groupId/leave",
  validateResource(groupIdParamSchema),
  groupController.leaveGroup as RequestHandler,
);

// Invite-Code regenerieren
router.post(
  "/:groupId/regenerate-invite",
  validateResource(groupIdParamSchema),
  groupController.regenerateInviteCode as RequestHandler,
);

// Mitglieder verwalten
router.patch(
  "/:groupId/members/:memberId",
  validateResource(updateMemberSchema),
  groupController.updateMember as RequestHandler,
);

router.delete(
  "/:groupId/members/:memberId",
  validateResource(removeMemberSchema),
  groupController.removeMember as RequestHandler,
);

// Task-Routen (Sub-Router)
router.use("/:groupId/tasks", taskRoutes);

export default router;
