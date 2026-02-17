import { InventoryService } from "../../services/inventory.service";
import { Inventory, Product, OrderItem } from "../../types";
import sequelize from "../../config/database";

describe("InventoryService", () => {
  let service: InventoryService;

  // Mock Transaction Object
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  beforeEach(() => {
    service = new InventoryService();
    jest.clearAllMocks();
    // Spy on sequelize.transaction to return our mock object
    jest
      .spyOn(sequelize, "transaction")
      .mockResolvedValue(mockTransaction as any);
  });

  describe("decreaseStock", () => {
    it("should successfully decrease stock, track sale, and commit transaction", async () => {
      const productId = 1;
      const remainingStock = 5;
      const mockProduct = { id: 1, price: 99.99 };

      // 1. Mock Product findByPk
      jest.spyOn(Product, "findByPk").mockResolvedValue(mockProduct as any);

      // 2. Mock Increment (Static version used in service)
      jest
        .spyOn(Inventory, "increment")
        .mockResolvedValue([[undefined, 1]] as any);

      // 3. Mock findByPk returning VALID stock
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        productId,
        quantity: remainingStock,
      } as any);

      // 4. Mock OrderItem creation
      jest.spyOn(OrderItem, "create").mockResolvedValue({ id: 1 } as any);

      // 5. Run
      const result = await service.decreaseStock(productId, 1);

      // 6. Assertions
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Product.findByPk).toHaveBeenCalledWith(productId, {
        transaction: mockTransaction,
      });
      expect(Inventory.increment).toHaveBeenCalledWith(
        { quantity: -1 },
        { where: { productId }, transaction: mockTransaction }
      );
      expect(OrderItem.create).toHaveBeenCalledWith(
        {
          productId,
          quantity: 1,
          priceAtPurchase: 99.99,
        },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result.quantity).toBe(remainingStock);
    });

    it("should rollback and throw error if stock drops below zero", async () => {
      const productId = 1;
      const mockProduct = { id: 1, price: 99.99 };

      jest.spyOn(Product, "findByPk").mockResolvedValue(mockProduct as any);
      jest.spyOn(Inventory, "increment").mockResolvedValue([] as any);

      // Mock findByPk returning NEGATIVE stock
      jest.spyOn(Inventory, "findByPk").mockResolvedValue({
        productId,
        quantity: -1,
      } as any);

      // Expect the service to throw
      await expect(service.decreaseStock(productId, 1)).rejects.toThrow(
        "OUT_OF_STOCK"
      );

      // Assert Rollback
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it("should rollback and throw error if product not found", async () => {
      const productId = 999;

      jest.spyOn(Product, "findByPk").mockResolvedValue(null);

      await expect(service.decreaseStock(productId, 1)).rejects.toThrow(
        "Product not found"
      );

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe("adjustStock", () => {
    it("should update specific product stock", async () => {
      const mockInventory = {
        quantity: 10,
        increment: jest.fn().mockResolvedValue(undefined),
        reload: jest.fn().mockResolvedValue({ quantity: 60 }),
      };
      // After reload, quantity should be updated
      mockInventory.reload.mockImplementation(async () => {
        mockInventory.quantity = 60;
        return mockInventory;
      });
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(mockInventory as any);

      const result = await service.addStock(1, 50);

      expect(mockInventory.increment).toHaveBeenCalledWith("quantity", { by: 50 });
      expect(mockInventory.reload).toHaveBeenCalled();
      expect(result.quantity).toBe(60);
    });

    it("should throw error if inventory record missing", async () => {
      jest.spyOn(Inventory, "findByPk").mockResolvedValue(null);

      await expect(service.addStock(1, 50)).rejects.toThrow();
    });
  });
});
