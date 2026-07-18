import { NextFunction, Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/successResponse";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);
  return req.user.id;
};

const getParamId = (req: Request): string => {
  const id = req.params.id;
  if (Array.isArray(id)) return id[0];
  return id;
};

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const task = await TaskService.create(userId, req.body);
      return successResponse(res, 201, "Task created successfully", { task });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const tasks = await TaskService.getAll(userId);
      return successResponse(res, 200, "Tasks fetched successfully", { tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const task = await TaskService.getById(userId, getParamId(req));
      return successResponse(res, 200, "Task fetched successfully", { task });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const task = await TaskService.update(userId, getParamId(req), req.body);
      return successResponse(res, 200, "Task updated successfully", { task });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      await TaskService.remove(userId, getParamId(req));
      return successResponse(res, 200, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
