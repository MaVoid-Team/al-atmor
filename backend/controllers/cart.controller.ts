import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cart.service";
import { orderService } from "../services/order.service";

export class CartController {
  /**
   * GET /cart
   * Get the current user's cart with all items
   * Query params: locationId?, discountCode?
   */
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const locationId = req.query.locationId ? Number(req.query.locationId) : undefined;
      const discountCode = req.query.discountCode as string | undefined;

      const result = await cartService.getCart(userId, {
        locationId,
        discountCode,
      });

      res.json({
        cartId: result.cart.id,
        items: result.items.map((item) => ({
          id: item.id,
          itemType: item.itemType,
          productId: item.productId,
          bundleId: item.bundleId,
          product: item.Product,
          bundle: item.Bundle,
          quantity: item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        totals: result.totals,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /cart/items
   * Add an item to cart (product or bundle)
   * Body: { productId?: number, bundleId?: number, quantity?: number }
   */
  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const { productId, bundleId, quantity = 1 } = req.body;

      if (!productId && !bundleId) {
        return res.status(400).json({ error: "Either productId or bundleId is required" });
      }

      if (productId && bundleId) {
        return res.status(400).json({ error: "Cannot specify both productId and bundleId" });
      }

      const item = await cartService.addItem(userId, { productId, bundleId }, quantity);

      res.status(201).json({
        message: "Item added to cart",
        item: {
          id: item.id,
          itemType: item.itemType,
          productId: item.productId,
          bundleId: item.bundleId,
          quantity: item.quantity,
        },
      });
    } catch (err: any) {
      if (err.message === "Product not found" || err.message === "Bundle not found") {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === "Bundle is not available") {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  };

  /**
   * PUT /cart/items/:id
   * Update item quantity
   * Query params: type (product|bundle)
   * Body: { quantity: number }
   */
  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const id = Number(req.params.id);
      const type = req.query.type as string;
      const { quantity } = req.body;

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({ error: "quantity is required" });
      }

      if (!type || !["product", "bundle"].includes(type)) {
        return res.status(400).json({ error: "type query parameter is required (product or bundle)" });
      }

      const input = type === "product" ? { productId: id } : { bundleId: id };
      const item = await cartService.updateItemQuantity(userId, input, quantity);

      if (!item) {
        return res.json({ message: "Item removed from cart" });
      }

      res.json({
        message: "Item quantity updated",
        item: {
          id: item.id,
          itemType: item.itemType,
          productId: item.productId,
          bundleId: item.bundleId,
          quantity: item.quantity,
        },
      });
    } catch (err: any) {
      if (err.message === "Item not found in cart") {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  };

  /**
   * DELETE /cart/items/:id
   * Remove an item from cart
   * Query params: type (product|bundle)
   */
  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const id = Number(req.params.id);
      const type = req.query.type as string;

      if (!type || !["product", "bundle"].includes(type)) {
        return res.status(400).json({ error: "type query parameter is required (product or bundle)" });
      }

      const input = type === "product" ? { productId: id } : { bundleId: id };
      const removed = await cartService.removeItem(userId, input);

      if (!removed) {
        return res.status(404).json({ error: "Item not found in cart" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /cart
   * Clear all items from cart
   */
  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;

      await cartService.clearCart(userId);

      res.json({ message: "Cart cleared" });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /cart/count
   * Get the number of items in cart
   */
  getItemCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const count = await cartService.getItemCount(userId);

      res.json({ count });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /cart/validate
   * Validate that all cart items have sufficient stock
   */
  validateCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const result = await cartService.validateStock(userId);

      if (!result.valid) {
        return res.status(400).json({
          valid: false,
          message: "Some items have insufficient stock",
          invalidItems: result.invalidItems,
        });
      }

      res.json({
        valid: true,
        message: "All items have sufficient stock",
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /cart/checkout
   * Convert cart into an order (cash) or create payment intention (card)
   * Body: { paymentType: "cash" | "card", locationId: number, discountCode?: string, billingData?: {...} }
   */
  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const { paymentType = "cash", locationId, addressId, discountCode, billingData } = req.body;

      // Validate payment type
      if (!["cash", "card"].includes(paymentType)) {
        return res.status(400).json({ error: "Invalid payment type. Must be 'cash' or 'card'" });
      }

      // Validate locationId is provided
      if (!locationId) {
        return res.status(400).json({ error: "locationId is required" });
      }

      if (paymentType === "cash") {
        // Cash: Create order immediately
        const order = await orderService.checkout(userId, {
          locationId,
          addressId,
          discountCode,
        });
        return res.status(201).json({ message: "Order created", order });
      }

      // Card: Create Paymob payment intention
      if (!billingData) {
        return res.status(400).json({ error: "billingData is required for card payments" });
      }

      // Get cart data for payment intention
      const { items, totals } = await cartService.getCart(userId, {
        locationId,
        discountCode,
      });

      if (!items.length) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Import ProductService dynamically to avoid circular deps
      const { ProductService } = await import("../services/product.service");
      const productService = new ProductService();

      // Convert cart items to Paymob format (amounts in cents)
      // amount = unit price in cents (Paymob calculates total as sum of amount * quantity)
      const paymobItems = items.map((item) => {
        let price = 0;
        let name = "Unknown Item";

        if (item.itemType === "bundle" && item.Bundle) {
          price = Number(item.Bundle.price);
          name = item.Bundle.name;
        } else if (item.Product) {
          // Use final price after discount_percent
          price = productService.calculateFinalPrice(item.Product);
          name = item.Product.name;
        }

        return {
          name,
          amount: Math.round(price * 100),
          description: item.itemType === "bundle" ? `Bundle #${item.bundleId}` : `SKU: ${item.Product?.sku || item.productId}`,
          quantity: item.quantity,
        };
      });

      // Calculate subtotal in cents (sum of item.amount * item.quantity)
      const subtotalCents = paymobItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

      // Get tax and shipping from totals (calculated by cart service based on locationId)
      const taxAmount = totals.tax || 0;
      const shippingAmount = totals.shipping || 0;

      // Convert tax and shipping to cents
      const taxCents = Math.round(taxAmount * 100);
      const shippingCents = Math.round(shippingAmount * 100);

      // Add shipping as a Paymob item if there's a shipping fee
      if (shippingCents > 0) {
        paymobItems.push({
          name: "Shipping Fee",
          amount: shippingCents,
          description: "Shipping and handling",
          quantity: 1,
        });
      }

      // Add tax as a Paymob item if there's tax
      if (taxCents > 0) {
        paymobItems.push({
          name: "Tax",
          amount: taxCents,
          description: "Value Added Tax (VAT)",
          quantity: 1,
        });
      }

      // Total amount in cents = subtotal + tax + shipping
      const amountCents = subtotalCents + taxCents + shippingCents;

      // Import paymobService dynamically to avoid circular deps
      const { paymobService } = await import("../services/paymob.service");

      // Get URLs for callbacks
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

      // Encode locationId and discountCode in special_reference
      const checkoutData = {
        userId,
        locationId,
        addressId: addressId || null,
        discountCode: discountCode || null,
        timestamp: Date.now(),
      };
      const encodedData = Buffer.from(JSON.stringify(checkoutData)).toString("base64");

      const intention = await paymobService.createPaymentIntention({
        amount: amountCents,
        currency: "EGP",
        items: paymobItems,
        billing_data: {
          first_name: billingData.firstName,
          last_name: billingData.lastName,
          phone_number: billingData.phone,
          email: billingData.email,
          street: billingData.address,
          city: billingData.city,
          state: billingData.state,
          country: "Egypt",
        },
        special_reference: encodedData,
        notification_url: `${backendUrl}/webhooks/paymob/callback`,
        redirection_url: `${frontendUrl}/checkout/success`,
      });

      const checkoutUrl = paymobService.generateCheckoutUrl(intention.client_secret);

      return res.status(200).json({
        message: "Payment intention created",
        checkoutUrl,
        intentionId: intention.id,
        orderId: intention.intention_order_id,
      });
    } catch (err: any) {
      if (err.message === "Cart is empty") {
        return res.status(400).json({ error: err.message });
      }
      if (err.message?.startsWith("Insufficient stock")) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message?.startsWith("Paymob API error")) {
        return res.status(502).json({ error: "Payment gateway error", details: err.message });
      }
      next(err);
    }
  };
}

export const cartController = new CartController();
