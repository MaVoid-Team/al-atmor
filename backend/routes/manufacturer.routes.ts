import { Router } from "express";
import { ManufacturerController } from "../controllers/manufacturer.controller";

const router = Router();
const controller = new ManufacturerController();

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
