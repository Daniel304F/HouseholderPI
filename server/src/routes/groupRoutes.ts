import { Router } from "express";
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

const router = Router();

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Gruppen CRUD
router.post(
  "/",
  validateResource(createGroupSchema),
  groupController.createGroup
);

router.get("/", groupController.getMyGroups);

router.get(
  "/:groupId",
  validateResource(groupIdParamSchema),
  groupController.getGroup
);

router.patch(
  "/:groupId",
  validateResource(updateGroupSchema),
  groupController.updateGroup
);

router.delete(
  "/:groupId",
  validateResource(groupIdParamSchema),
  groupController.deleteGroup
);

// Gruppe beitreten/verlassen
router.post(
  "/join",
  validateResource(joinGroupSchema),
  groupController.joinGroup
);

router.post(
  "/:groupId/leave",
  validateResource(groupIdParamSchema),
  groupController.leaveGroup
);

// Invite-Code regenerieren
router.post(
  "/:groupId/regenerate-invite",
  validateResource(groupIdParamSchema),
  groupController.regenerateInviteCode
);

// Mitglieder verwalten
router.patch(
  "/:groupId/members/:memberId",
  validateResource(updateMemberSchema),
  groupController.updateMember
);

router.delete(
  "/:groupId/members/:memberId",
  validateResource(removeMemberSchema),
  groupController.removeMember
);

export default router;
