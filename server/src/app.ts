import { errorHandler } from "./middlewares/errorHandler.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { loggerMiddleware } from "./middlewares/logger.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(loggerMiddleware);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
// Global error Handler
app.use(errorHandler);

export default app;
