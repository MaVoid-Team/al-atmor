import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All order routes require authentication
router.use(authenticate);

// List user's orders
router.get("/", orderController.list);

// Get single order (must belong to authenticated user)
router.get("/:id", orderController.detail);

export default router;
