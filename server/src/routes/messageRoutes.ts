import { Router, RequestHandler } from "express";
import * as messageController from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import { uploadChatImage } from "../config/upload.config.js";
import {
  createMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
  messageReactionSchema,
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

// Bildnachricht erstellen (Text optional)
router.post(
  "/image",
  uploadChatImage.single("image"),
  messageController.createImageMessage as RequestHandler
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

// Reaktionen
router.post(
  "/:messageId/reactions",
  validateResource(messageReactionSchema),
  messageController.addReaction as RequestHandler
);

router.delete(
  "/:messageId/reactions",
  validateResource(messageReactionSchema),
  messageController.removeReaction as RequestHandler
);

export default router;
