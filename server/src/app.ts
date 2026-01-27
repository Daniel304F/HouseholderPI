import { errorHandler } from "./middlewares/errorHandler.js";
import express, { RequestHandler } from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import * as taskController from "./controllers/taskController.js";
import * as statisticsController from "./controllers/statisticsController.js";
import cookieParser from "cookie-parser";
import { UPLOAD_PATH } from "./config/upload.config.js";

const app = express();
app.use(loggerMiddleware);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically (public access)
app.use("/uploads", express.static(UPLOAD_PATH));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/friends", friendRoutes);

// Meine Aufgaben Route (außerhalb von groups)
app.get(
  "/api/tasks/my",
  authMiddleware,
  taskController.getMyTasks as RequestHandler,
);

// Personal statistics route
app.get(
  "/api/statistics/personal",
  authMiddleware,
  statisticsController.getPersonalStatistics as RequestHandler,
);

// Global error Handler
app.use(errorHandler);

export default app;
