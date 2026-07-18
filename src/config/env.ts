import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid Environment Variables", _env.error.format());
  throw new Error("Invalid Environment Variables");
}

export const config = {
  port: _env.data.PORT,
  databaseUrl: _env.data.DATABASE_URL,
  jwtSecret: _env.data.JWT_SECRET,
  jwtExpiresIn: _env.data.JWT_EXPIRES_IN,
  nodeEnvironment: _env.data.NODE_ENV,
};
