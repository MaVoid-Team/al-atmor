import { Inventory, Product, OrderItem } from "../types";
import sequelize from "../config/database";

export class InventoryService {
  async getStock(productId: number) {
    return await Inventory.findByPk(productId);
  }

  // Admin: Manually set stock (e.g., new shipment arrived)
  async addStock(productId: number, quantityToAdd: number) {
    // 1. Validate input
    if (quantityToAdd <= 0) {
      throw new Error("Restock quantity must be positive");
    }

    // 2. Check if inventory record exists first
    const inventory = await Inventory.findByPk(productId);
    if (!inventory) throw new Error("Product inventory not found");

    // 3. Atomic Update: SQL "UPDATE inventories SET quantity = quantity + X"
    await inventory.increment("quantity", { by: quantityToAdd });

    // 4. Return the refreshed record
    return await inventory.reload();
  }

  // User: Buy Item (also tracks sale in order_items)
  async decreaseStock(
    productId: number,
    quantity: number,
    options: { orderId?: number } = {}
  ) {
    const t = await sequelize.transaction();
    try {
      // Get product price before decrementing
      const product = await Product.findByPk(productId, { transaction: t });
      if (!product) throw new Error("Product not found");

      // Decrease inventory
      await Inventory.increment(
        { quantity: -quantity },
        { where: { productId }, transaction: t }
      );

      const updated = await Inventory.findByPk(productId, { transaction: t });
      if (!updated || updated.quantity < 0) throw new Error("OUT_OF_STOCK");

      // Track sale in order_items for best sellers
      await OrderItem.create(
        {
          productId,
          quantity,
          priceAtPurchase: product.price,
          orderId: options.orderId,
        },
        { transaction: t }
      );

      await t.commit();
      return updated;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
