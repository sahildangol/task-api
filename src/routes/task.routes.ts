import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from "../schemas/task.schema";

const router = Router();

router.use(protect);

router.post("/", validate(createTaskSchema), TaskController.create);
router.get("/", TaskController.getAll);
router.get("/:id", validate(taskIdParamSchema), TaskController.getById);
router.patch("/:id", validate(updateTaskSchema), TaskController.update);
router.delete("/:id", validate(taskIdParamSchema), TaskController.remove);

export default router;
