import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import type { OrderStatus, PaymentStatus } from "../types/Order";
import {
  Cart,
  CartItem,
  Inventory,
  Order,
  OrderItem,
  Product,
  User,
  Location,
  ProductBundle,
  BundleProduct,
  UserAddress,
} from "../types";
import { buildDateRange, DatePeriod } from "../utils/dateRange";
import { cartService } from "./cart.service";
import locationService from "./location.service";
import discountService from "./discount.service";
import { ProductService } from "./product.service";

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const productService = new ProductService();

interface OrderFilters {
  userId?: number;
  status?: string;
  search?: string;
  period?: DatePeriod;
  date?: string;
  startDate?: string;
  endDate?: string;
}

interface OrderUpdatePayload {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  metadata?: Record<string, any> | null;
}

interface CheckoutOptions {
  locationId: number;
  addressId?: number;
  discountCode?: string;
}

export class OrderService {
  private toPlain(order: Order | null) {
    return order ? order.get({ plain: true }) : null;
  }

  private async getCartWithItems(userId: number, transaction: Transaction) {
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "discountPercent"],
        },
        {
          model: ProductBundle,
          as: "Bundle",
          attributes: ["id", "name", "price"],
          include: [
            {
              model: BundleProduct,
              as: "BundleProducts",
              include: [
                {
                  model: Product,
                  as: "Product",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
      transaction,
      lock: { level: transaction.LOCK.UPDATE, of: CartItem },
    });

    return { cart, items };
  }

  async checkout(userId: number, options: CheckoutOptions) {
    const t = await sequelize.transaction();
    try {
      // Validate location
      const location = await locationService.getById(options.locationId);
      if (!location) {
        throw new Error("Invalid location");
      }

      const { cart, items } = await this.getCartWithItems(userId, t);

      if (!items.length) {
        throw new Error("Cart is empty");
      }

      // Check stock for all items
      const stockCheckResults: Array<{
        itemType: "product" | "bundle";
        item: CartItem;
        insufficientProducts: Array<{
          productId: number;
          required: number;
          available: number;
        }>;
      }> = [];

      for (const item of items) {
        if (item.itemType === "product" && item.productId) {
          const inventory = await Inventory.findOne({
            where: { productId: item.productId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          if (!inventory || inventory.quantity < item.quantity) {
            stockCheckResults.push({
              itemType: "product",
              item,
              insufficientProducts: [
                {
                  productId: item.productId,
                  required: item.quantity,
                  available: inventory?.quantity || 0,
                },
              ],
            });
          }
        } else if (item.itemType === "bundle" && item.bundleId && item.Bundle) {
          // Check all bundle products
          const bundleProducts = item.Bundle.BundleProducts || [];
          const insufficientProducts: Array<{
            productId: number;
            required: number;
            available: number;
          }> = [];

          for (const bundleProduct of bundleProducts) {
            const requiredQuantity = bundleProduct.quantity * item.quantity;
            const inventory = await Inventory.findOne({
              where: { productId: bundleProduct.productId },
              transaction: t,
              lock: t.LOCK.UPDATE,
            });

            const availableQuantity = inventory ? inventory.quantity : 0;
            if (availableQuantity < requiredQuantity) {
              insufficientProducts.push({
                productId: bundleProduct.productId,
                required: requiredQuantity,
                available: availableQuantity,
              });
            }
          }

          if (insufficientProducts.length > 0) {
            stockCheckResults.push({
              itemType: "bundle",
              item,
              insufficientProducts,
            });
          }
        }
      }

      if (stockCheckResults.length > 0) {
        throw new Error("Insufficient stock for one or more items");
      }

      // Calculate subtotal (with product discounts applied)
      let subtotal = 0;
      const orderItemsData: Array<{
        orderId?: number;
        productId: number;
        quantity: number;
        priceAtPurchase: number;
      }> = [];

      for (const item of items) {
        if (item.itemType === "bundle" && item.Bundle) {
          // Bundle: use fixed bundle price
          const bundlePrice = Number(item.Bundle.price);
          subtotal += bundlePrice * item.quantity;

          // Create order item for bundle (we'll use metadata to track it's a bundle)
          // Since OrderItem references products, we'll need to create items for each product in bundle
          const bundleProducts = item.Bundle.BundleProducts || [];
          for (const bundleProduct of bundleProducts) {
            orderItemsData.push({
              productId: bundleProduct.productId,
              quantity: bundleProduct.quantity * item.quantity,
              priceAtPurchase: bundlePrice / bundleProducts.length, // Distribute bundle price
            });
          }
        } else if (item.Product && item.productId) {
          // Product: use price with discount_percent applied
          const finalPrice = productService.calculateFinalPrice(item.Product);
          subtotal += finalPrice * item.quantity;

          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: finalPrice,
          });
        }
      }

      subtotal = roundCurrency(subtotal);

      // Apply discount code if provided
      let discount = 0;
      let discountCodeId: number | undefined;

      if (options.discountCode) {
        const appliedDiscount = await discountService.apply(
          options.discountCode,
          subtotal
        );
        discount = appliedDiscount.discountAmount;
        discountCodeId = appliedDiscount.discountCode.id;
      }

      const subtotalAfterDiscount = roundCurrency(subtotal - discount);

      // Calculate tax and shipping based on location
      const tax = locationService.calculateTax(subtotalAfterDiscount, location);
      const shipping = locationService.calculateShipping(
        subtotalAfterDiscount,
        location
      );
      const total = roundCurrency(subtotalAfterDiscount + tax + shipping);

      // Create order with metadata about discount and address
      const orderMetadata: Record<string, any> = {};
      if (discountCodeId) {
        orderMetadata.discountCodeId = discountCodeId;
        orderMetadata.discountCode = options.discountCode;
        orderMetadata.discountAmount = discount;
      }
      if (options.addressId) {
        orderMetadata.addressId = options.addressId;
      }

      const order = await Order.create(
        {
          userId,
          locationId: options.locationId,
          subtotal,
          tax,
          total,
          shipping,
          currency: "EGP",
          status: "pending",
          paymentStatus: "unpaid",
          placedAt: new Date(),
          metadata:
            Object.keys(orderMetadata).length > 0 ? orderMetadata : null,
        },
        { transaction: t }
      );

      // Create order items
      await OrderItem.bulkCreate(
        orderItemsData.map((item) => ({
          ...item,
          orderId: order.id,
        })),
        { transaction: t }
      );

      // Decrement inventory for all products
      for (const item of items) {
        if (item.itemType === "product" && item.productId) {
          await Inventory.increment(
            { quantity: -item.quantity },
            { where: { productId: item.productId }, transaction: t }
          );
        } else if (item.itemType === "bundle" && item.Bundle) {
          // Decrement inventory for all bundle products
          const bundleProducts = item.Bundle.BundleProducts || [];
          for (const bundleProduct of bundleProducts) {
            const quantityToDecrement = bundleProduct.quantity * item.quantity;
            await Inventory.increment(
              { quantity: -quantityToDecrement },
              { where: { productId: bundleProduct.productId }, transaction: t }
            );
          }
        }
      }

      // Increment discount code usage if used
      if (discountCodeId) {
        await discountService.incrementUsage(discountCodeId, t);
      }

      // Clear cart
      await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

      const created = await Order.findByPk(order.id, {
        include: [
          { model: OrderItem, as: "items" },
          { model: User, as: "user", attributes: ["id", "email", "role"] },
          { model: Location, as: "location" },
        ],
        transaction: t,
      });

      await t.commit();

      // Convert to plain object and add shipping address if exists
      const plainOrder = created ? (created.get({ plain: true }) as any) : null;

      if (plainOrder && options.addressId) {
        const address = await UserAddress.findByPk(options.addressId);
        if (address) {
          const addressData = address.get({ plain: true });
          plainOrder.shippingAddress = {
            fullName: addressData.recipientName,
            addressLine1: addressData.streetAddress,
            addressLine2: addressData.buildingNumber
              ? `Building ${addressData.buildingNumber}${addressData.secondaryNumber ? `, Unit ${addressData.secondaryNumber}` : ''}`
              : null,
            city: addressData.city,
            state: addressData.district,
            postalCode: addressData.postalCode,
            country: 'Egypt',
            phoneNumber: addressData.phoneNumber,
            label: addressData.label,
          };
        }
      }

      return plainOrder;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async listOrders(page = 1, limit = 10, filters: OrderFilters = {}) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Global search across order ID and user email using raw SQL for OR across tables
    if (filters.search) {
      const searchTerm = filters.search.trim();
      // Escape special characters for LIKE pattern
      const escapedSearch = searchTerm.replace(/[%_]/g, '\\$&');

      // Use Sequelize.literal for cross-table OR condition
      where[Op.and] = sequelize.literal(
        `("Order"."id"::text ILIKE '%${escapedSearch}%' OR "user"."email" ILIKE '%${escapedSearch}%')`
      );
    }

    if (filters.period && filters.period !== "all") {
      const range = buildDateRange(filters.period, {
        date: filters.date,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      if (range.start && range.end) {
        where.placedAt = {
          [Op.between]: [range.start, range.end],
        };
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role"],
        },
        { model: OrderItem, as: "items" },
        { model: Location, as: "location" },
      ],
      order: [["placedAt", "DESC"]],
      limit,
      offset,
      subQuery: false, // Required for literal to work with joined table
    });

    return {
      data: rows.map((row) => row.get({ plain: true })),
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  async getOrderById(id: number) {
    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["id", "email", "role"] },
        { model: OrderItem, as: "items" },
        { model: Location, as: "location" },
      ],
    });

    if (!order) {
      return null;
    }

    const plainOrder = order.get({ plain: true }) as any;

    // Fetch delivery address if addressId exists in metadata
    if (plainOrder.metadata?.addressId) {
      const address = await UserAddress.findByPk(plainOrder.metadata.addressId);
      if (address) {
        const addressData = address.get({ plain: true });
        plainOrder.shippingAddress = {
          fullName: addressData.recipientName,
          addressLine1: addressData.streetAddress,
          addressLine2: addressData.buildingNumber
            ? `Building ${addressData.buildingNumber}${addressData.secondaryNumber ? `, Unit ${addressData.secondaryNumber}` : ''}`
            : null,
          city: addressData.city,
          state: addressData.district,
          postalCode: addressData.postalCode,
          country: 'Egypt',
          phoneNumber: addressData.phoneNumber,
          label: addressData.label,
        };
      }
    }

    return plainOrder;
  }

  async updateOrder(id: number, updates: OrderUpdatePayload) {
    const order = await Order.findByPk(id);
    if (!order) {
      return null;
    }

    const fieldsToUpdate: Partial<OrderUpdatePayload> = {};

    if (updates.status) {
      fieldsToUpdate.status = updates.status;
    }

    if (updates.paymentStatus) {
      fieldsToUpdate.paymentStatus = updates.paymentStatus;
    }

    if (updates.metadata !== undefined) {
      fieldsToUpdate.metadata = updates.metadata;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return this.getOrderById(id);
    }

    await order.update(fieldsToUpdate);
    return this.getOrderById(id);
  }

  async deleteOrder(id: number) {
    const deletedCount = await Order.destroy({ where: { id } });
    return deletedCount === 1;
  }
}

export const orderService = new OrderService();
