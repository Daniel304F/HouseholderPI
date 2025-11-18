import { errorHandler } from "./middlewares/errorHandler.js";
import express from "express";

const app = express();
app.use(express.json());

// Routes

// Global error Handler
app.use(errorHandler);

export default app;
