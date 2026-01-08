import { errorHandler } from "./middlewares/errorHandler.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
// Global error Handler
app.use(errorHandler);

export default app;
