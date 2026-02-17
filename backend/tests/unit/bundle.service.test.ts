import bundleService from "../../services/bundle.service";
import ProductBundle from "../../types/ProductBundle";
import BundleProduct from "../../types/BundleProduct";
import Product from "../../types/Product";
import Inventory from "../../types/Inventory";
import Category from "../../types/Category";
import Manufacturer from "../../types/Manufacturer";
import ProductType from "../../types/ProductType";
import CartItem from "../../types/CartItem";
import Cart from "../../types/Cart";
import OrderItem from "../../types/OrderItem";
import Order from "../../types/Order";
import UserAddress from "../../types/UserAddress";
import User from "../../types/User";
import sequelize from "../../config/database";
import { initAssociations } from "../../types";

describe("BundleService", () => {
  let product1: Product;
  let product2: Product;
  let product3: Product;
  let manufacturer: Manufacturer;
  let productType: ProductType;

  beforeAll(async () => {
    initAssociations();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up in correct order to avoid foreign key constraints
    await OrderItem.destroy({ where: {}, force: true });
    await Order.destroy({ where: {}, force: true });
    await CartItem.destroy({ where: {}, force: true });
    await Cart.destroy({ where: {}, force: true });
    await BundleProduct.destroy({ where: {}, force: true });
    await ProductBundle.destroy({ where: {}, force: true });
    await Inventory.destroy({ where: {}, force: true });
    await Product.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await Manufacturer.destroy({ where: {}, force: true });
    await ProductType.destroy({ where: {}, force: true });
    await UserAddress.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    // Create test manufacturer
    manufacturer = await Manufacturer.create({
      name: "Test Manufacturer",
    });

    // Create test product type
    productType = await ProductType.create({
      name: "Test Type",
      allowedAttributes: {},
    });

    // Create test category
    const category = await Category.create({
      name: "Test Category",
      slug: "test-category",
      imageUrl: "test.jpg",
    });

    // Create test products
    product1 = await Product.create({
      name: "Product 1",
      sku: "P1",
      price: 100,
      categoryId: category.id,
      manufacturerId: manufacturer.id,
      productTypeId: productType.id,
      imageUrl: "test1.jpg",
      specs: {},
    });

    product2 = await Product.create({
      name: "Product 2",
      sku: "P2",
      price: 150,
      categoryId: category.id,
      manufacturerId: manufacturer.id,
      productTypeId: productType.id,
      imageUrl: "test2.jpg",
      specs: {},
    });

    product3 = await Product.create({
      name: "Product 3",
      sku: "P3",
      price: 200,
      categoryId: category.id,
      manufacturerId: manufacturer.id,
      productTypeId: productType.id,
      imageUrl: "test3.jpg",
      specs: {},
    });

    // Create inventories
    await Inventory.create({ productId: product1.id, quantity: 50 });
    await Inventory.create({ productId: product2.id, quantity: 30 });
    await Inventory.create({ productId: product3.id, quantity: 20 });
  });

  describe("create", () => {
    it("should create a bundle with multiple products", async () => {
      const bundleData = {
        name: "Test Bundle",
        description: "Bundle of products",
        price: 200,
        imageUrl: "bundle.jpg",
        active: true,
        products: [
          { productId: product1.id, quantity: 2 },
          { productId: product2.id, quantity: 1 },
        ],
      };

      const bundle = await bundleService.create(bundleData);

      expect(bundle).toBeDefined();
      expect(bundle.name).toBe("Test Bundle");
      expect(Number(bundle.price)).toBe(200);
    });

    it("should throw error for non-existent product", async () => {
      const bundleData = {
        name: "Invalid Bundle",
        price: 200,
        products: [{ productId: 99999, quantity: 1 }],
      };

      await expect(bundleService.create(bundleData)).rejects.toThrow(
        "Products not found: 99999"
      );
    });

    it("should throw error for duplicate products in bundle", async () => {
      const bundleData = {
        name: "Duplicate Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 2 },
          { productId: product1.id, quantity: 1 },
        ],
      };

      await expect(bundleService.create(bundleData)).rejects.toThrow(
        "Bundle contains duplicate products"
      );
    });
  });

  describe("getAll", () => {
    it("should return all bundles with products", async () => {
      await bundleService.create({
        name: "Bundle 1",
        price: 200,
        active: true,
        products: [{ productId: product1.id, quantity: 1 }],
      });
      await bundleService.create({
        name: "Bundle 2",
        price: 300,
        active: false,
        products: [{ productId: product2.id, quantity: 1 }],
      });

      const result = await bundleService.getAll(false);

      expect(result.bundles).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should return only active bundles when activeOnly is true", async () => {
      await bundleService.create({
        name: "Active Bundle",
        price: 200,
        active: true,
        products: [{ productId: product1.id, quantity: 1 }],
      });
      await bundleService.create({
        name: "Inactive Bundle",
        price: 300,
        active: false,
        products: [{ productId: product2.id, quantity: 1 }],
      });

      const result = await bundleService.getAll(true);

      expect(result.bundles).toHaveLength(1);
      expect(result.bundles[0].name).toBe("Active Bundle");
    });

    it("should handle pagination correctly", async () => {
      // Create 5 bundles
      for (let i = 1; i <= 5; i++) {
        await bundleService.create({
          name: `Bundle ${i}`,
          price: 100 * i,
          active: true,
          products: [{ productId: product1.id, quantity: 1 }],
        });
      }

      // Get first page with 2 items
      const page1 = await bundleService.getAll(false, 1, 2);
      expect(page1.bundles).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBe(3);

      // Get second page
      const page2 = await bundleService.getAll(false, 2, 2);
      expect(page2.bundles).toHaveLength(2);
      expect(page2.page).toBe(2);
    });
  });

  describe("getById", () => {
    it("should return bundle with products", async () => {
      const bundle = await bundleService.create({
        name: "Test Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 2 },
          { productId: product2.id, quantity: 1 },
        ],
      });

      const found = await bundleService.getById(bundle.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Bundle");
      expect(found?.BundleProducts).toHaveLength(2);
    });

    it("should return null for non-existent bundle", async () => {
      const found = await bundleService.getById(99999);

      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("should update bundle name and price", async () => {
      const bundle = await bundleService.create({
        name: "Original Bundle",
        price: 200,
        products: [{ productId: product1.id, quantity: 1 }],
      });

      const updated = await bundleService.update(bundle.id, {
        name: "Updated Bundle",
        price: 250,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Bundle");
      expect(Number(updated?.price)).toBe(250);
    });

    it("should update bundle products", async () => {
      const bundle = await bundleService.create({
        name: "Test Bundle",
        price: 200,
        products: [{ productId: product1.id, quantity: 1 }],
      });

      const updated = await bundleService.update(bundle.id, {
        products: [
          { productId: product2.id, quantity: 2 },
          { productId: product3.id, quantity: 1 },
        ],
      });

      expect(updated).toBeDefined();
      expect(updated?.BundleProducts).toHaveLength(2);
    });
  });

  describe("delete", () => {
    it("should soft delete bundle", async () => {
      const bundle = await bundleService.create({
        name: "To Delete",
        price: 200,
        products: [{ productId: product1.id, quantity: 1 }],
      });

      await bundleService.delete(bundle.id);

      const found = await bundleService.getById(bundle.id);
      expect(found?.active).toBe(false);
    });
  });

  describe("checkStock", () => {
    it("should return available when all products have sufficient stock", async () => {
      const bundle = await bundleService.create({
        name: "Stock Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 5 }, // Available: 50
          { productId: product2.id, quantity: 3 }, // Available: 30
        ],
      });

      const stockCheck = await bundleService.checkStock(bundle.id, 2);

      expect(stockCheck.available).toBe(true);
      expect(stockCheck.insufficientProducts).toBeUndefined();
    });

    it("should return unavailable when product has insufficient stock", async () => {
      const bundle = await bundleService.create({
        name: "Stock Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 10 }, // Available: 50
          { productId: product2.id, quantity: 20 }, // Available: 30
        ],
      });

      const stockCheck = await bundleService.checkStock(bundle.id, 2);

      expect(stockCheck.available).toBe(false);
      expect(stockCheck.insufficientProducts).toHaveLength(1);
      expect(stockCheck.insufficientProducts?.[0].productId).toBe(product2.id);
      expect(stockCheck.insufficientProducts?.[0].required).toBe(40);
      expect(stockCheck.insufficientProducts?.[0].available).toBe(30);
    });

    it("should handle multiple insufficient products", async () => {
      const bundle = await bundleService.create({
        name: "Stock Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 30 }, // Available: 50
          { productId: product2.id, quantity: 20 }, // Available: 30
        ],
      });

      const stockCheck = await bundleService.checkStock(bundle.id, 2);

      expect(stockCheck.available).toBe(false);
      expect(stockCheck.insufficientProducts).toHaveLength(2);
    });

    it("should throw error for non-existent bundle", async () => {
      await expect(bundleService.checkStock(99999, 1)).rejects.toThrow(
        /Bundle.*not found/
      );
    });
  });

  describe("getBundleProductsWithInventory", () => {
    it("should return products with inventory information", async () => {
      const bundle = await bundleService.create({
        name: "Test Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 2 },
          { productId: product2.id, quantity: 1 },
        ],
      });

      const products = await bundleService.getBundleProductsWithInventory(
        bundle.id
      );

      expect(products).toHaveLength(2);
      expect(products[0]).toHaveProperty("bundleQuantity");
      expect(products[0]).toHaveProperty("availableStock");
    });

    it("should throw error for non-existent bundle", async () => {
      await expect(
        bundleService.getBundleProductsWithInventory(99999)
      ).rejects.toThrow(/Bundle.*not found/);
    });
  });

  describe("hardDelete", () => {
    it("should permanently delete bundle and its products", async () => {
      const bundle = await bundleService.create({
        name: "To Hard Delete",
        price: 200,
        products: [{ productId: product1.id, quantity: 1 }],
      });

      await bundleService.hardDelete(bundle.id);

      const found = await ProductBundle.findByPk(bundle.id, {
        paranoid: false,
      });
      expect(found).toBeNull();
    });
  });
});
