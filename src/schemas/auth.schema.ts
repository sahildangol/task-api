import { UserSchema } from "../generated/zod";
import { z } from "zod";

export const registerSchema = z.object({
  body: UserSchema.pick({
    email: true,
    name: true,
    password: true,
  }).extend({
    email: z
      .string()
      .trim()
      .email("Invalid Email")
      .transform((value) => value.toLowerCase()),
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name cannot exceed 80 characters"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password cannot exceed 128 characters"),
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid Email")
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  }).strict(),
});
