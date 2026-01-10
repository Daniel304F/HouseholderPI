import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";

export const validateResource =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join(".").replace("body.", ""),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validierungsfehler",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
