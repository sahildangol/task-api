import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { message: "Too many requests from this IP, please try again after 15 minutes" } },
});

router.post("/register", authLimiter, validate(registerSchema), AuthController.register);

router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

export default router;
