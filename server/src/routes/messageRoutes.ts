import { Router, RequestHandler } from "express";
import * as messageController from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  createMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
} from "../schemas/message.schema.js";

const router = Router({ mergeParams: true });

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Nachrichten abrufen
router.get(
  "/",
  validateResource(getMessagesSchema),
  messageController.getMessages as RequestHandler
);

// Nachricht erstellen
router.post(
  "/",
  validateResource(createMessageSchema),
  messageController.createMessage as RequestHandler
);

// Nachricht aktualisieren
router.patch(
  "/:messageId",
  validateResource(updateMessageSchema),
  messageController.updateMessage as RequestHandler
);

// Nachricht löschen
router.delete(
  "/:messageId",
  validateResource(deleteMessageSchema),
  messageController.deleteMessage as RequestHandler
);

export default router;
