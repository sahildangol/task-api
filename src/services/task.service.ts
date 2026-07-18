import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  isCompleted: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

const taskWithOwnerSelect = {
  ...taskSelect,
  userId: true,
} satisfies Prisma.TaskSelect;

type TaskResponse = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

export class TaskService {
  static async getOwnedTask(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: taskWithOwnerSelect,
    });
    if (!task) throw new AppError("Task not found", 404);
    if (task.userId !== userId) throw new AppError("Forbidden", 403);
    return task;
  }

  static async create(userId: string, data: {
    title: string;
    description?: string;
  }): Promise<TaskResponse> {
    return prisma.task.create({
      data: { ...data, userId },
      select: taskSelect,
    });
  }

  static async getAll(userId: string): Promise<TaskResponse[]> {
    return prisma.task.findMany({
      where: { userId },
      select: taskSelect,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await TaskService.getOwnedTask(userId, taskId);
    const { userId: _u, ...rest } = task;
    return rest;
  }

  static async update(
    userId: string,
    taskId: string,
    data: Partial<{ title: string; description: string; isCompleted: boolean }>,
  ): Promise<TaskResponse> {
    await TaskService.getOwnedTask(userId, taskId);
    return prisma.task.update({
      where: { id: taskId },
      data,
      select: taskSelect,
    });
  }

  static async remove(userId: string, taskId: string): Promise<void> {
    await TaskService.getOwnedTask(userId, taskId);
    await prisma.task.delete({ where: { id: taskId } });
  }
}
