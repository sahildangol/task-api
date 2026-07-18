import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(255, "Title cannot exceed 255 characters"),
    description: z.string().trim().max(2000, "Description cannot exceed 2000 characters").optional(),
  }).strict(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(2000).optional(),
    isCompleted: z.boolean().optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid task ID"),
  }).strict(),
});
