import { Router } from "express";
import { adminUserController } from "../controllers/adminUser.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("readAny", "user"),
  adminUserController.list
);

router.get(
  "/:id",
  authorize("readAny", "user"),
  adminUserController.getOne
);

router.post(
  "/",
  authorize("createAny", "user"),
  adminUserController.create
);

router.put(
  "/:id",
  authorize("updateAny", "user"),
  adminUserController.update
);

router.delete(
  "/:id",
  authorize("deleteAny", "user"),
  adminUserController.delete
);

export default router;
