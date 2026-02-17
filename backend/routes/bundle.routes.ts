import { Router } from "express";
import bundleController from "../controllers/bundle.controller";

const router = Router();

// Public routes for bundles
router.get("/", (req, res, next) => bundleController.getAll(req, res, next));
router.get("/:id", (req, res, next) => bundleController.getById(req, res, next));
router.get("/:id/stock", (req, res, next) => bundleController.checkStock(req, res, next));
router.get("/:id/products", (req, res, next) => bundleController.getBundleProducts(req, res, next));

export default router;
