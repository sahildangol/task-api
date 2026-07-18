import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { config } from "../config/env";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err && typeof err === "object" && "code" in err) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: { message: "Resource already exists" },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: { message: "Not found" },
      });
    }
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";
  const stack = err instanceof Error ? err.stack : undefined;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      stack: config.nodeEnvironment === "development" ? stack : undefined,
    },
  });
};
