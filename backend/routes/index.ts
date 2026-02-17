import { Router } from "express";
import manufacturerRoutes from "./manufacturer.routes";
import productTypeRoutes from "./productType.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import authRoutes from "./auth.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import userAddressRoutes from "./userAddress.routes";
import adminRoutes from "./admin.routes";
import paymobRoutes from "./paymob.routes";
import bundleRoutes from "./bundle.routes";
import discountController from "../controllers/discount.controller";
import locationController from "../controllers/location.controller";

const router = Router();

router.use("/manufacturers", manufacturerRoutes);
router.use("/product-types", productTypeRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/admin", adminRoutes);
router.use("/webhooks/paymob", paymobRoutes);
router.use("/bundles", bundleRoutes);

// Public discount validation endpoint
router.post("/discounts/validate", (req, res, next) => discountController.validate(req, res, next));
router.get("/discounts/active", (req, res, next) => discountController.getActive(req, res, next));

// Public locations endpoints
router.get("/locations", (req, res, next) => locationController.getAll(req, res, next));
router.get("/locations/city/:cityName", (req, res, next) => locationController.getByCity(req, res, next));
router.get("/locations/cities/:cityName", (req, res, next) => locationController.getAllByCity(req, res, next));

export default router;
