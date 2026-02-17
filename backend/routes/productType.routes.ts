import { Router } from "express";
import { ProductTypeController } from "../controllers/productType.controller";

const router = Router();
const controller = new ProductTypeController();

router.get("/", controller.getAll);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
