import { Router } from "express";
import { userAddressController } from "../controllers/userAddress.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// All address routes require authentication
router.use(authenticate);

// Get all addresses
router.get("/", userAddressController.getAllAddresses);

// Get default address (must be before /:id to avoid conflict)
router.get("/default", userAddressController.getDefaultAddress);

// Get specific address
router.get("/:id", userAddressController.getAddress);

// Create new address
router.post("/", userAddressController.createAddress);

// Update address
router.put("/:id", userAddressController.updateAddress);

// Delete address
router.delete("/:id", userAddressController.deleteAddress);

// Set address as default
router.patch("/:id/default", userAddressController.setDefault);

export default router;
