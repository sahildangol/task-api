import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import { globalErrorHandler } from "./middleware/error.middleware";
import { AppError } from "./utils/AppError";

const app: Application = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ methods: ["GET", "POST", "PATCH", "DELETE"] }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.all("/{*path}", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(globalErrorHandler);

export default app;
