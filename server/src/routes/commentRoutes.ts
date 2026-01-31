import { Router, RequestHandler } from "express";
import * as commentController from "../controllers/commentController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validation.middleware.js";
import {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
} from "../schemas/comment.schema.js";

const router = Router({ mergeParams: true });

// Alle Routen erfordern Authentifizierung
router.use(authMiddleware);

// Kommentare abrufen
router.get(
  "/",
  validateResource(getCommentsSchema),
  commentController.getComments as RequestHandler
);

// Kommentar erstellen
router.post(
  "/",
  validateResource(createCommentSchema),
  commentController.createComment as RequestHandler
);

// Kommentar aktualisieren
router.patch(
  "/:commentId",
  validateResource(updateCommentSchema),
  commentController.updateComment as RequestHandler
);

// Kommentar löschen
router.delete(
  "/:commentId",
  validateResource(deleteCommentSchema),
  commentController.deleteComment as RequestHandler
);

export default router;
