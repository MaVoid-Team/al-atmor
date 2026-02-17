import { Router } from "express";
import { paymobController } from "../controllers/paymob.controller";

const router = Router();

// Webhook endpoint - no authentication required (verified via HMAC)
router.post("/", paymobController.handleWebhook);

// Payment verification endpoint
router.get("/verify/:orderId", paymobController.verifyPayment);

export default router;
