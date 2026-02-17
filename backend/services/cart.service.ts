import { Transaction } from "sequelize";
import sequelize from "../config/database";
import Cart from "../types/Cart";
import CartItem from "../types/CartItem";
import Product from "../types/Product";
import ProductBundle from "../types/ProductBundle";
import BundleProduct from "../types/BundleProduct";
import Inventory from "../types/Inventory";
import locationService from "./location.service";
import discountService from "./discount.service";
import { ProductService } from "./product.service";

interface CartItemInput {
  productId?: number;
  bundleId?: number;
  quantity: number;
}

interface CartWithItems extends Cart {
  items: CartItem[];
}

interface CartTotalsOptions {
  locationId?: number;
  discountCode?: string;
}

interface CartTotals {
  subtotal: number;
  itemCount: number;
  discount: number;
  discountCode?: string;
  subtotalAfterDiscount: number;
  tax: number;
  shipping: number;
  total: number;
  locationId?: number;
  locationName?: string;
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const productService = new ProductService();

export class CartService {
  /**
   * Get or create a cart for a user
   */
  async getOrCreateCart(userId: number): Promise<Cart> {
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
    });
    return cart;
  }

  /**
   * Get full cart with items and product details
   */
  async getCart(
    userId: number,
    options?: CartTotalsOptions
  ): Promise<{
    cart: Cart;
    items: CartItem[];
    totals: CartTotals;
  }> {
    const cart = await this.getOrCreateCart(userId);

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          attributes: [
            "id",
            "name",
            "sku",
            "price",
            "discountPercent",
            "imageUrl",
          ],
        },
        {
          model: ProductBundle,
          as: "Bundle",
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate totals
    const totals = await this.calculateTotals(items, options);

    return { cart, items, totals };
  }

  /**
   * Calculate cart totals with location-based tax/shipping and discount codes
   */
  async calculateTotals(
    items: CartItem[],
    options?: CartTotalsOptions
  ): Promise<CartTotals> {
    // Calculate subtotal (sum of original prices after product discounts)
    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      itemCount += item.quantity;

      if (item.itemType === "bundle" && item.Bundle) {
        // Bundles use fixed price, no product discount
        const bundlePrice = Number(item.Bundle.price);
        subtotal += bundlePrice * item.quantity;
      } else if (item.Product) {
        // Products use price with discount_percent applied
        const finalPrice = productService.calculateFinalPrice(item.Product);
        subtotal += finalPrice * item.quantity;
      }
    }

    subtotal = roundCurrency(subtotal);

    // Apply discount code if provided (applies to original subtotal)
    let discount = 0;
    let discountCodeUsed: string | undefined;

    if (options?.discountCode) {
      try {
        const appliedDiscount = await discountService.apply(
          options.discountCode,
          subtotal
        );
        discount = appliedDiscount.discountAmount;
        discountCodeUsed = appliedDiscount.discountCode.code;
      } catch (error) {
        // If discount fails, continue without it
        console.warn("Discount application failed:", error);
      }
    }

    const subtotalAfterDiscount = roundCurrency(subtotal - discount);

    // Calculate tax and shipping based on location
    let tax = 0;
    let shipping = 0;
    let locationId: number | undefined;
    let locationName: string | undefined;

    if (options?.locationId) {
      const location = await locationService.getById(options.locationId);
      if (location) {
        tax = locationService.calculateTax(subtotalAfterDiscount, location);
        shipping = locationService.calculateShipping(
          subtotalAfterDiscount,
          location
        );
        locationId = location.id;
        locationName = location.name;
      }
    }

    const total = roundCurrency(subtotalAfterDiscount + tax + shipping);

    return {
      subtotal,
      itemCount,
      discount,
      discountCode: discountCodeUsed,
      subtotalAfterDiscount,
      tax,
      shipping,
      total,
      locationId,
      locationName,
    };
  }

  /**
   * Add item to cart (product or bundle)
   */
  async addItem(
    userId: number,
    input: { productId?: number; bundleId?: number },
    quantity: number = 1
  ): Promise<CartItem> {
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Must specify either productId or bundleId, but not both
    if (
      (input.productId && input.bundleId) ||
      (!input.productId && !input.bundleId)
    ) {
      throw new Error("Must specify either productId or bundleId");
    }

    const cart = await this.getOrCreateCart(userId);

    if (input.productId) {
      // Verify product exists
      const product = await Product.findByPk(input.productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Check if item already exists in cart
      const existingItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId: input.productId,
          itemType: "product",
        },
      });

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        await existingItem.save();
        return existingItem;
      }

      // Create new cart item
      return await CartItem.create({
        cartId: cart.id,
        productId: input.productId,
        bundleId: null,
        itemType: "product",
        quantity,
      });
    } else {
      // Handle bundle
      const bundle = await ProductBundle.findByPk(input.bundleId);
      if (!bundle) {
        throw new Error("Bundle not found");
      }

      if (!bundle.active) {
        throw new Error("Bundle is not available");
      }

      // Check if bundle already exists in cart
      const existingItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          bundleId: input.bundleId,
          itemType: "bundle",
        },
      });

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
        await existingItem.save();
        return existingItem;
      }

      // Create new cart item
      return await CartItem.create({
        cartId: cart.id,
        productId: null,
        bundleId: input.bundleId,
        itemType: "bundle",
        quantity,
      });
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateItemQuantity(
    userId: number,
    input: { productId?: number; bundleId?: number },
    quantity: number
  ): Promise<CartItem | null> {
    if (quantity < 1) {
      // If quantity is 0 or less, remove the item
      await this.removeItem(userId, input);
      return null;
    }

    const cart = await this.getOrCreateCart(userId);

    const where: {
      cartId: number;
      productId?: number;
      bundleId?: number;
      itemType?: string;
    } = {
      cartId: cart.id,
    };

    if (input.productId) {
      where.productId = input.productId;
      where.itemType = "product";
    } else if (input.bundleId) {
      where.bundleId = input.bundleId;
      where.itemType = "bundle";
    } else {
      throw new Error("Must specify either productId or bundleId");
    }

    const item = await CartItem.findOne({ where });

    if (!item) {
      throw new Error("Item not found in cart");
    }

    item.quantity = quantity;
    await item.save();
    return item;
  }

  /**
   * Remove item from cart
   */
  async removeItem(
    userId: number,
    input: { productId?: number; bundleId?: number }
  ): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const where: {
      cartId: number;
      productId?: number;
      bundleId?: number;
      itemType?: string;
    } = {
      cartId: cart.id,
    };

    if (input.productId) {
      where.productId = input.productId;
      where.itemType = "product";
    } else if (input.bundleId) {
      where.bundleId = input.bundleId;
      where.itemType = "bundle";
    } else {
      throw new Error("Must specify either productId or bundleId");
    }

    const deletedCount = await CartItem.destroy({ where });

    return deletedCount > 0;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: number): Promise<boolean> {
    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return false;
    }

    await CartItem.destroy({
      where: { cartId: cart.id },
    });

    return true;
  }

  /**
   * Get cart item count
   */
  async getItemCount(userId: number): Promise<number> {
    const cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      return 0;
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      attributes: ["quantity"],
    });

    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Validate cart items have sufficient stock
   * Returns items that don't have enough stock
   */
  async validateStock(userId: number): Promise<{
    valid: boolean;
    invalidItems: Array<{
      type: "product" | "bundle";
      id: number;
      name: string;
      requestedQuantity: number;
      insufficientProducts?: Array<{
        productId: number;
        productName: string;
        required: number;
        available: number;
      }>;
    }>;
  }> {
    const { items } = await this.getCart(userId);

    const invalidItems: Array<{
      type: "product" | "bundle";
      id: number;
      name: string;
      requestedQuantity: number;
      insufficientProducts?: Array<{
        productId: number;
        productName: string;
        required: number;
        available: number;
      }>;
    }> = [];

    for (const item of items) {
      if (item.itemType === "product" && item.productId) {
        // Check product stock
        const inventory = await Inventory.findOne({
          where: { productId: item.productId },
        });

        if (!inventory || inventory.quantity < item.quantity) {
          invalidItems.push({
            type: "product",
            id: item.productId,
            name: item.Product?.name || "Unknown Product",
            requestedQuantity: item.quantity,
            insufficientProducts: [
              {
                productId: item.productId,
                productName: item.Product?.name || "Unknown Product",
                required: item.quantity,
                available: inventory?.quantity || 0,
              },
            ],
          });
        }
      } else if (item.itemType === "bundle" && item.bundleId) {
        // Check bundle stock (all constituent products)
        const bundle = await ProductBundle.findByPk(item.bundleId, {
          include: [
            {
              model: BundleProduct,
              as: "BundleProducts",
              include: [
                {
                  model: Product,
                  as: "Product",
                },
              ],
            },
          ],
        });

        if (bundle && bundle.BundleProducts) {
          const insufficientProducts: Array<{
            productId: number;
            productName: string;
            required: number;
            available: number;
          }> = [];

          for (const bundleProduct of bundle.BundleProducts) {
            const requiredQuantity = bundleProduct.quantity * item.quantity;
            const inventory = await Inventory.findOne({
              where: { productId: bundleProduct.productId },
            });

            const availableQuantity = inventory ? inventory.quantity : 0;

            if (availableQuantity < requiredQuantity) {
              insufficientProducts.push({
                productId: bundleProduct.productId,
                productName: bundleProduct.Product?.name || "Unknown Product",
                required: requiredQuantity,
                available: availableQuantity,
              });
            }
          }

          if (insufficientProducts.length > 0) {
            invalidItems.push({
              type: "bundle",
              id: item.bundleId,
              name: bundle.name,
              requestedQuantity: item.quantity,
              insufficientProducts,
            });
          }
        }
      }
    }

    return {
      valid: invalidItems.length === 0,
      invalidItems,
    };
  }
}

export const cartService = new CartService();
