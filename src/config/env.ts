import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5001),
  DB_USER: z.string().min(1).default("postgres"),
  DB_PASSWORD: z.string().min(1),
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1).default("task_manager_db"),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid Environment Variables", _env.error.format());
  throw new Error("Invalid Environment Variables");
}

const databaseUrl = `postgresql://${_env.data.DB_USER}:${encodeURIComponent(_env.data.DB_PASSWORD)}@${_env.data.DB_HOST}:${_env.data.DB_PORT}/${_env.data.DB_NAME}`;

process.env.DATABASE_URL = databaseUrl;

export const config = {
  port: _env.data.PORT,
  databaseUrl,
  dbUser: _env.data.DB_USER,
  dbPassword: _env.data.DB_PASSWORD,
  dbHost: _env.data.DB_HOST,
  dbPort: _env.data.DB_PORT,
  dbName: _env.data.DB_NAME,
  jwtSecret: _env.data.JWT_SECRET,
  jwtExpiresIn: _env.data.JWT_EXPIRES_IN,
  nodeEnvironment: _env.data.NODE_ENV,
};
