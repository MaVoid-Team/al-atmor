import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get cart with all items
router.get("/", cartController.getCart);

// Get item count (useful for cart badge)
router.get("/count", cartController.getItemCount);

// Validate cart stock before checkout
router.get("/validate", cartController.validateCart);

// Checkout and create order
router.post("/checkout", cartController.checkout);

// Add item to cart
router.post("/items", cartController.addItem);

// Update item quantity
router.put("/items/:productId", cartController.updateItem);

// Remove item from cart
router.delete("/items/:productId", cartController.removeItem);

// Clear entire cart
router.delete("/", cartController.clearCart);

export default router;
