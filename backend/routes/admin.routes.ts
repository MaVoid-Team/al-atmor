import { Router } from "express";
import adminUserRoutes from "./adminUser.routes";
import adminOrderRoutes from "./adminOrder.routes";
import locationRoutes from "./location.routes";
import adminDiscountRoutes from "./adminDiscount.routes";
import adminBundleRoutes from "./adminBundle.routes";

const router = Router();

router.use("/users", adminUserRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/locations", locationRoutes);
router.use("/discounts", adminDiscountRoutes);
router.use("/bundles", adminBundleRoutes);

export default router;
