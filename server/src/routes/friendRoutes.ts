import { Router, RequestHandler } from "express";
import * as friendController from "../controllers/friendController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  sendFriendRequestSchema,
  friendRequestIdParamSchema,
  friendIdParamSchema,
  respondToRequestSchema,
} from "../schemas/friend.schema.js";

const router = Router();

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Freunde abrufen
router.get("/", friendController.getFriends as RequestHandler);

// Empfangene Freundschaftsanfragen
router.get("/requests", friendController.getFriendRequests as RequestHandler);

// Gesendete Freundschaftsanfragen
router.get(
  "/requests/sent",
  friendController.getSentRequests as RequestHandler,
);

// Freundschaftsanfrage senden
router.post(
  "/request",
  validateResource(sendFriendRequestSchema),
  friendController.sendFriendRequest as RequestHandler,
);

// Auf Anfrage antworten (annehmen/ablehnen)
router.post(
  "/requests/:requestId/respond",
  validateResource(respondToRequestSchema),
  friendController.respondToRequest as RequestHandler,
);

// Anfrage zurückziehen
router.delete(
  "/requests/:requestId",
  validateResource(friendRequestIdParamSchema),
  friendController.cancelRequest as RequestHandler,
);

// Freund entfernen
router.delete(
  "/:friendId",
  validateResource(friendIdParamSchema),
  friendController.removeFriend as RequestHandler,
);

export default router;
