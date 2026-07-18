import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse } from "../utils/successResponse";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      return successResponse(res, 201, "User registered successfully", {
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return successResponse(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }
}
