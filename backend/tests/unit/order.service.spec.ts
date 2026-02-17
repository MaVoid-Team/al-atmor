import { orderService } from "../../services/order.service";
import locationService from "../../services/location.service";
import sequelize from "../../config/database";
import {
  Cart,
  CartItem,
  Inventory,
  Order,
  OrderItem,
  Product,
  User,
} from "../../types";

describe("OrderService", () => {
  const mockTransaction: any = {
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: { UPDATE: "UPDATE" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(sequelize, "transaction").mockResolvedValue(mockTransaction);
    mockTransaction.commit.mockReset();
    mockTransaction.rollback.mockReset();
    
    // Default mock for locationService
    jest.spyOn(locationService, "getById").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(locationService, "calculateTax").mockReturnValue(15);
    jest.spyOn(locationService, "calculateShipping").mockReturnValue(0);
  });

  describe("checkout", () => {
    it("creates order and clears cart", async () => {
      jest.spyOn(Cart, "findOrCreate").mockResolvedValue([{ id: 1 } as any, false]);
      jest.spyOn(CartItem, "findAll").mockResolvedValue([
        {
          productId: 10,
          quantity: 2,
          Product: { price: 50 },
        },
      ] as any);
      jest
        .spyOn(Inventory, "findOne")
        .mockResolvedValue({ productId: 10, quantity: 5 } as any);
      jest.spyOn(Order, "create").mockResolvedValue({ id: 100 } as any);
      jest.spyOn(OrderItem, "bulkCreate").mockResolvedValue([] as any);
      jest.spyOn(Inventory, "increment").mockResolvedValue(undefined as any);
      jest.spyOn(CartItem, "destroy").mockResolvedValue(1 as any);
      jest.spyOn(Order, "findByPk").mockResolvedValue({
        get: jest.fn().mockReturnValue({
          id: 100,
          total: 115,
          tax: 15,
          shipping: 0,
          userId: 1,
          items: [
            { productId: 10, quantity: 2, priceAtPurchase: 50 },
          ],
        }),
      } as any);

      const order = await orderService.checkout(1, { locationId: 1 });

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: 100,
          total: 115,
          tax: 15,
          shipping: 0,
          userId: 1,
        }),
        expect.any(Object)
      );
      expect(OrderItem.bulkCreate).toHaveBeenCalledTimes(1);
      expect(Inventory.increment).toHaveBeenCalledWith(
        { quantity: -2 },
        expect.objectContaining({ where: { productId: 10 } })
      );
      expect(CartItem.destroy).toHaveBeenCalledWith(
        { where: { cartId: 1 }, transaction: mockTransaction }
      );
      expect(order).toMatchObject({ id: 100, total: 115, tax: 15, shipping: 0 });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("throws when cart is empty", async () => {
      jest.spyOn(Cart, "findOrCreate").mockResolvedValue([{ id: 1 } as any, false]);
      jest.spyOn(CartItem, "findAll").mockResolvedValue([] as any);

      await expect(orderService.checkout(1, { locationId: 1 })).rejects.toThrow("Cart is empty");
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("throws when inventory insufficient", async () => {
      jest.spyOn(Cart, "findOrCreate").mockResolvedValue([{ id: 1 } as any, false]);
      jest.spyOn(CartItem, "findAll").mockResolvedValue([
        { productId: 10, quantity: 3, Product: { price: 50 }, itemType: "product" },
      ] as any);
      jest
        .spyOn(Inventory, "findOne")
        .mockResolvedValue({ productId: 10, quantity: 2 } as any);

      await expect(orderService.checkout(1, { locationId: 1 })).rejects.toThrow(
        /Insufficient stock/
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
