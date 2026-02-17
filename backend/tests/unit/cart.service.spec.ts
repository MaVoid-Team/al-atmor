import { CartService } from "../../services/cart.service";
import Cart from "../../types/Cart";
import CartItem from "../../types/CartItem";
import Product from "../../types/Product";
import Inventory from "../../types/Inventory";

describe("CartService", () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService();
    jest.clearAllMocks();
  });

  describe("getOrCreateCart", () => {
    it("should return existing cart if found", async () => {
      const mockCart = { id: 1, userId: 10 };
      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);

      const result = await service.getOrCreateCart(10);

      expect(Cart.findOrCreate).toHaveBeenCalledWith({
        where: { userId: 10 },
        defaults: { userId: 10 },
      });
      expect(result).toEqual(mockCart);
    });

    it("should create new cart if not found", async () => {
      const mockCart = { id: 2, userId: 20 };
      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, true]);

      const result = await service.getOrCreateCart(20);

      expect(result).toEqual(mockCart);
    });
  });

  describe("addItem", () => {
    it("should add new item to cart", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockProduct = { id: 5, name: "GPU", price: 500 };
      const mockCartItem = { id: 1, cartId: 1, productId: 5, quantity: 2 };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(Product, "findByPk").mockResolvedValue(mockProduct as any);
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);
      jest.spyOn(CartItem, "create").mockResolvedValue(mockCartItem as any);

      const result = await service.addItem(10, { productId: 5 }, 2);

      expect(Product.findByPk).toHaveBeenCalledWith(5);
      expect(CartItem.findOne).toHaveBeenCalledWith({
        where: { cartId: 1, productId: 5, itemType: "product" },
      });
      expect(CartItem.create).toHaveBeenCalledWith({
        cartId: 1,
        productId: 5,
        bundleId: null,
        itemType: "product",
        quantity: 2,
      });
      expect(result).toEqual(mockCartItem);
    });

    it("should update quantity if item already exists in cart", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockProduct = { id: 5, name: "GPU", price: 500 };
      const existingItem = {
        id: 1,
        cartId: 1,
        productId: 5,
        quantity: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(Product, "findByPk").mockResolvedValue(mockProduct as any);
      jest.spyOn(CartItem, "findOne").mockResolvedValue(existingItem as any);

      const result = await service.addItem(10, { productId: 5 }, 3);

      expect(existingItem.quantity).toBe(5); // 2 + 3
      expect(existingItem.save).toHaveBeenCalled();
    });

    it("should throw error if product not found", async () => {
      jest.spyOn(Product, "findByPk").mockResolvedValue(null);

      await expect(service.addItem(10, { productId: 999 }, 1)).rejects.toThrow(
        "Product not found"
      );
    });

    it("should throw error if quantity is less than 1", async () => {
      await expect(service.addItem(10, { productId: 5 }, 0)).rejects.toThrow(
        "Quantity must be at least 1"
      );
    });
  });

  describe("updateItemQuantity", () => {
    it("should update item quantity", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockItem = {
        id: 1,
        cartId: 1,
        productId: 5,
        quantity: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "findOne").mockResolvedValue(mockItem as any);

      const result = await service.updateItemQuantity(10, { productId: 5 }, 10);

      expect(mockItem.quantity).toBe(10);
      expect(mockItem.save).toHaveBeenCalled();
    });

    it("should remove item if quantity is 0 or less", async () => {
      const mockCart = { id: 1, userId: 10 };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(1);

      const result = await service.updateItemQuantity(10, { productId: 5 }, 0);

      expect(result).toBeNull();
    });

    it("should throw error if item not found in cart", async () => {
      const mockCart = { id: 1, userId: 10 };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);

      await expect(service.updateItemQuantity(10, { productId: 999 }, 5)).rejects.toThrow(
        "Item not found in cart"
      );
    });
  });

  describe("removeItem", () => {
    it("should remove item from cart", async () => {
      const mockCart = { id: 1, userId: 10 };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(1);

      const result = await service.removeItem(10, { productId: 5 });

      expect(CartItem.destroy).toHaveBeenCalledWith({
        where: { cartId: 1, productId: 5, itemType: "product" },
      });
      expect(result).toBe(true);
    });

    it("should return false if item not found", async () => {
      const mockCart = { id: 1, userId: 10 };

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(0);

      const result = await service.removeItem(10, { productId: 999 });

      expect(result).toBe(false);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      const mockCart = { id: 1, userId: 10 };

      jest.spyOn(Cart, "findOne").mockResolvedValue(mockCart as any);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(3);

      const result = await service.clearCart(10);

      expect(CartItem.destroy).toHaveBeenCalledWith({
        where: { cartId: 1 },
      });
      expect(result).toBe(true);
    });

    it("should return false if cart not found", async () => {
      jest.spyOn(Cart, "findOne").mockResolvedValue(null);

      const result = await service.clearCart(999);

      expect(result).toBe(false);
    });
  });

  describe("getItemCount", () => {
    it("should return total quantity of items in cart", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockItems = [{ quantity: 2 }, { quantity: 3 }, { quantity: 5 }];

      jest.spyOn(Cart, "findOne").mockResolvedValue(mockCart as any);
      jest.spyOn(CartItem, "findAll").mockResolvedValue(mockItems as any);

      const result = await service.getItemCount(10);

      expect(result).toBe(10); // 2 + 3 + 5
    });

    it("should return 0 if cart not found", async () => {
      jest.spyOn(Cart, "findOne").mockResolvedValue(null);

      const result = await service.getItemCount(999);

      expect(result).toBe(0);
    });
  });

  describe("validateStock", () => {
    it("should return valid true if all items have sufficient stock", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockItems = [
        { productId: 1, quantity: 2, itemType: "product", Product: { name: "GPU" } },
        { productId: 2, quantity: 1, itemType: "product", Product: { name: "CPU" } },
      ];

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "findAll").mockResolvedValue(mockItems as any);
      jest
        .spyOn(Inventory, "findOne")
        .mockResolvedValueOnce({ productId: 1, quantity: 10 } as any)
        .mockResolvedValueOnce({ productId: 2, quantity: 5 } as any);

      const result = await service.validateStock(10);

      expect(result.valid).toBe(true);
      expect(result.invalidItems).toHaveLength(0);
    });

    it("should return invalid items with insufficient stock", async () => {
      const mockCart = { id: 1, userId: 10 };
      const mockItems = [
        { productId: 1, quantity: 20, itemType: "product", Product: { name: "GPU" } },
      ];

      jest
        .spyOn(Cart, "findOrCreate")
        .mockResolvedValue([mockCart as any, false]);
      jest.spyOn(CartItem, "findAll").mockResolvedValue(mockItems as any);
      jest
        .spyOn(Inventory, "findOne")
        .mockResolvedValue({ productId: 1, quantity: 5 } as any);

      const result = await service.validateStock(10);

      expect(result.valid).toBe(false);
      expect(result.invalidItems).toHaveLength(1);
      expect(result.invalidItems[0]).toEqual({
        type: "product",
        id: 1,
        name: "GPU",
        requestedQuantity: 20,
        insufficientProducts: [
          {
            productId: 1,
            productName: "GPU",
            required: 20,
            available: 5,
          },
        ],
      });
    });
  });
});
