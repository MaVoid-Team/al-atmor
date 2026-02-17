import { Router } from "express";
import discountController from "../controllers/discount.controller";

const router = Router();

// Admin routes for discount codes
router.get("/", (req, res, next) => discountController.getAll(req, res, next));
router.get("/:id", (req, res, next) => discountController.getById(req, res, next));
router.post("/", (req, res, next) => discountController.create(req, res, next));
router.put("/:id", (req, res, next) => discountController.update(req, res, next));
router.delete("/:id", (req, res, next) => discountController.delete(req, res, next));

export default router;
