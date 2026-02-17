import { Router } from "express";
import locationController from "../controllers/location.controller";

const router = Router();

// Admin routes for locations
router.get("/", (req, res, next) => locationController.getAll(req, res, next));
router.get("/:id", (req, res, next) => locationController.getById(req, res, next));
router.post("/", (req, res, next) => locationController.create(req, res, next));
router.put("/:id", (req, res, next) => locationController.update(req, res, next));
router.delete("/:id", (req, res, next) => locationController.delete(req, res, next));

export default router;
