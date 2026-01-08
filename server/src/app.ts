import { errorHandler } from "./middlewares/errorHandler.js";
import express from "express";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());

// Routes
app.use("/users", userRoutes);
// Global error Handler
app.use(errorHandler);

export default app;
