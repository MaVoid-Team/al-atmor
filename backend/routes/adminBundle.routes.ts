import { Router } from "express";
import bundleController from "../controllers/bundle.controller";
import { singleImageUpload } from "../middleware/upload.middleware";

const router = Router();

// Admin routes for bundles
router.get("/", (req, res, next) => bundleController.getAll(req, res, next));
router.get("/:id", (req, res, next) => bundleController.getById(req, res, next));
router.post("/", singleImageUpload("image"), (req, res, next) => bundleController.create(req, res, next));
router.put("/:id", singleImageUpload("image"), (req, res, next) => bundleController.update(req, res, next));
router.delete("/:id", (req, res, next) => bundleController.delete(req, res, next));

export default router;
