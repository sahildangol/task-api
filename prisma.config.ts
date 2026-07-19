import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env["DATABASE_URL"] ??
  `postgresql://${process.env["DB_USER"] || "postgres"}:${process.env["DB_PASSWORD"] || "your_db_password"}@${process.env["DB_HOST"] || "localhost"}:${process.env["DB_PORT"] || "5432"}/${process.env["DB_NAME"] || "task_manager_db"}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
