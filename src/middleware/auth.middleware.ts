import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AppError } from "../utils/AppError";

type AuthTokenPayload = {
  id: string;
  email: string;
  role: string;
};

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new AppError("Authorization token is missing", 401);
    }

    const token = authorizationHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Authorization token is missing", 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    if (typeof decoded !== "object" || !decoded) {
      throw new AppError("Invalid authorization token", 401);
    }

    const { id, email, role } = decoded as Partial<AuthTokenPayload>;

    if (typeof id !== "string" || typeof email !== "string" || typeof role !== "string") {
      throw new AppError("Invalid authorization token", 401);
    }

    req.user = {
      id,
      email,
      role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    next(new AppError("Invalid or expired token", 401));
  }
};
