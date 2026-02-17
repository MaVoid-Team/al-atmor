import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { singleImageUpload } from "../middleware/upload.middleware";

const router = Router();
const controller = new CategoryController();

router.get("/tree", controller.getTree); // Specialized endpoint first
router.get("/", controller.getAll); // Flat list
router.get("/:id", controller.getOne);
router.post("/", singleImageUpload("image"), controller.create);
router.put("/:id", singleImageUpload("image"), controller.update);
router.delete("/:id", controller.delete);

export default router;
