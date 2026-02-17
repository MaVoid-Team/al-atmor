import { Router } from "express";
import { adminOrderController } from "../controllers/adminOrder.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/analytics/summary",
  authorize("readAny", "orderAnalytics"),
  adminOrderController.analytics
);

router.get(
  "/",
  authorize("readAny", "order"),
  adminOrderController.list
);

router.get(
  "/:id",
  authorize("readAny", "order"),
  adminOrderController.detail
);

router.put(
  "/:id",
  authorize("updateAny", "order"),
  adminOrderController.update
);

router.delete(
  "/:id",
  authorize("deleteAny", "order"),
  adminOrderController.delete
);

export default router;
