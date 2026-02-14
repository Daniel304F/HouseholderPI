import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message =
    statusCode >= 500 ? "Internal Server Error" : err.message || "Unknown Error";
  res
    .status(statusCode)
    .json({ success: false, message });
};
