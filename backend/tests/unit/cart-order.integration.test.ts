import { cartService } from "../../services/cart.service";
import { orderService } from "../../services/order.service";
import locationService from "../../services/location.service";
import discountService from "../../services/discount.service";
import bundleService from "../../services/bundle.service";
import Product from "../../types/Product";
import Category from "../../types/Category";
import Manufacturer from "../../types/Manufacturer";
import ProductType from "../../types/ProductType";
import User from "../../types/User";
import Cart from "../../types/Cart";
import CartItem from "../../types/CartItem";
import Order from "../../types/Order";
import OrderItem from "../../types/OrderItem";
import Inventory from "../../types/Inventory";
import Location from "../../types/Location";
import DiscountCode from "../../types/DiscountCode";
import ProductBundle from "../../types/ProductBundle";
import BundleProduct from "../../types/BundleProduct";
import UserAddress from "../../types/UserAddress";
import sequelize from "../../config/database";
import { initAssociations } from "../../types";

const createActiveDiscountRange = () => {
  const now = Date.now();
  return {
    validFrom: new Date(now - 1000 * 60 * 60),
    validTo: new Date(now + 1000 * 60 * 60),
  };
};

describe("Cart and Order Integration", () => {
  let user: User;
  let product1: Product;
  let product2: Product;
  let category: Category;
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
    await Location.destroy({ where: {}, force: true });
    await DiscountCode.destroy({ where: {}, force: true });

    // Create test user
    user = await User.create({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "hashedpassword",
      role: "customer",
    });

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
    category = await Category.create({
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
      discountPercent: null,
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
      discountPercent: 10, // 10% discount
      specs: {},
    });

    // Create inventories
    await Inventory.create({ productId: product1.id, quantity: 50 });
    await Inventory.create({ productId: product2.id, quantity: 30 });
  });

  describe("Product Discount Integration", () => {
    it("should apply product-level discount in cart", async () => {
      await cartService.addItem(
        user.id,
        {
          productId: product2.id,
        },
        2
      );

      const { totals } = await cartService.getCart(user.id);

      // Product2 price: 150, discount: 10%, final: 135
      // Subtotal: 135 * 2 = 270
      expect(totals.subtotal).toBe(270);
    });

    it("should apply product discount before coupon discount", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0,
        shippingRate: 0,
      });

      const discount = await discountService.create({
        code: "SAVE10",
        type: "percentage",
        value: 10,
        active: true,
        ...createActiveDiscountRange(),
      });

      await cartService.addItem(
        user.id,
        {
          productId: product2.id,
        },
        1
      );

      const { totals } = await cartService.getCart(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      // Product2: 150 * 0.9 (product discount) = 135
      // Subtotal: 135
      // Coupon: 135 * 0.1 = 13.5
      // Total after coupon: 135 - 13.5 = 121.5
      expect(totals.subtotal).toBe(135);
      expect(totals.discount).toBe(13.5);
      expect(totals.subtotalAfterDiscount).toBe(121.5);
    });
  });

  describe("Location-based Tax and Shipping", () => {
    it("should calculate tax and shipping based on location", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.1,
      });

      await cartService.addItem(
        user.id,
        {
          productId: product1.id,
        },
        1
      );

      const { totals } = await cartService.getCart(user.id, {
        locationId: location.id,
      });

      // Subtotal: 100
      // Tax: 15
      // Shipping: 10
      // Total: 125
      expect(totals.subtotal).toBe(100);
      expect(totals.tax).toBe(15);
      expect(totals.shipping).toBe(10);
      expect(totals.total).toBe(125);
    });

    it("should require location for checkout", async () => {
      await cartService.addItem(
        user.id,
        {
          productId: product1.id,
        },
        1
      );

      // @ts-expect-error - intentionally passing undefined locationId for test
      await expect(orderService.checkout(user.id, {})).rejects.toThrow(
        "Invalid location"
      );
    });
  });

  describe("Bundle Integration", () => {
    it("should add bundle to cart and calculate price", async () => {
      const bundle = await bundleService.create({
        name: "Test Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 1 },
        ],
      });

      await cartService.addItem(
        user.id,
        {
          bundleId: bundle.id,
        },
        1
      );

      const { totals } = await cartService.getCart(user.id);

      expect(totals.subtotal).toBe(200);
    });

    it("should check bundle stock before checkout", async () => {
      const bundle = await bundleService.create({
        name: "Test Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 10 },
          { productId: product2.id, quantity: 10 },
        ],
      });

      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0,
        shippingRate: 0,
      });

      await cartService.addItem(
        user.id,
        {
          bundleId: bundle.id,
        },
        5
      );

      // Product2 only has 30 in stock, should fail
      await expect(
        orderService.checkout(user.id, { locationId: location.id })
      ).rejects.toThrow();
    });
  });

  describe("Discount Code Integration", () => {
    it("should apply percentage discount code", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.1,
      });

      const discount = await discountService.create({
        code: "SAVE20",
        type: "percentage",
        value: 20,
        active: true,
        ...createActiveDiscountRange(),
      });

      await cartService.addItem(user.id, {
        productId: product1.id,
      }, 1);

      const { totals } = await cartService.getCart(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      // Subtotal: 100
      // Discount: 20 (20% of 100)
      // After discount: 80
      // Tax: 12 (15% of 80)
      // Shipping: 8 (10% of 80)
      // Total: 100
      expect(totals.discount).toBe(20);
      expect(totals.subtotalAfterDiscount).toBe(80);
      expect(totals.tax).toBe(12);
      expect(totals.shipping).toBe(8);
      expect(totals.total).toBe(100);
    });

    it("should apply fixed discount code", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0,
        shippingRate: 0,
      });

      const discount = await discountService.create({
        code: "FIXED50",
        type: "fixed",
        value: 50,
        active: true,
        ...createActiveDiscountRange(),
      });

      await cartService.addItem(user.id, {
        productId: product1.id,
      }, 1);

      const { totals } = await cartService.getCart(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      // Subtotal: 100
      // Discount: 50
      // Total: 50
      expect(totals.discount).toBe(50);
      expect(totals.total).toBe(50);
    });

    it("should increment discount usage after order", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0,
        shippingRate: 0,
      });

      const discount = await discountService.create({
        code: "USAGE",
        type: "percentage",
        value: 10,
        active: true,
        ...createActiveDiscountRange(),
      });

      await cartService.addItem(user.id, {
        productId: product1.id,
      }, 1);

      const initialDiscount = await discountService.getById(discount.id);
      expect(initialDiscount?.usedCount).toBe(0);

      await orderService.checkout(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      const updatedDiscount = await discountService.getById(discount.id);
      expect(updatedDiscount?.usedCount).toBe(1);
    });
  });

  describe("Complete Checkout Flow", () => {
    it("should complete checkout with location, discount, and bundle", async () => {
      const location = await locationService.create({
        name: "Complete Test Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.1,
      });

      const discount = await discountService.create({
        code: "COMPLETE",
        type: "percentage",
        value: 10,
        active: true,
        ...createActiveDiscountRange(),
      });

      const bundle = await bundleService.create({
        name: "Complete Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 1 },
          { productId: product2.id, quantity: 1 },
        ],
      });

      // Add regular product
      await cartService.addItem(user.id, {
        productId: product1.id,
      }, 2);

      // Add bundle
      await cartService.addItem(user.id, {
        bundleId: bundle.id,
      }, 1);

      const { totals } = await cartService.getCart(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      // Subtotal: 200 (2*100) + 200 (bundle) = 400
      // Discount: 40 (10% of 400)
      // After discount: 360
      // Tax: 54 (15% of 360)
      // Shipping: 36 (10% of 360)
      // Total: 450
      expect(totals.subtotal).toBe(400);
      expect(totals.discount).toBe(40);
      expect(totals.tax).toBe(54);
      expect(totals.shipping).toBe(36);
      expect(totals.total).toBe(450);

      const order = await orderService.checkout(user.id, {
        locationId: location.id,
        discountCode: discount.code,
      });

      expect(order).toBeDefined();
      expect(order?.locationId).toBe(location.id);
      expect(Number(order?.total)).toBe(450);
    });

    it("should store location reference in order", async () => {
      const location = await locationService.create({
        name: "Order Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.1,
      });

      await cartService.addItem(user.id, {
        productId: product1.id,
      }, 1);

      const order = await orderService.checkout(user.id, {
        locationId: location.id,
      });

      expect(order?.locationId).toBe(location.id);
    });

    it("should decrement inventory for bundle products", async () => {
      const bundle = await bundleService.create({
        name: "Inventory Bundle",
        price: 200,
        products: [
          { productId: product1.id, quantity: 5 },
          { productId: product2.id, quantity: 3 },
        ],
      });

      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0,
        shippingRate: 0,
      });

      const initialInventory1 = await Inventory.findOne({
        where: { productId: product1.id },
      });
      const initialInventory2 = await Inventory.findOne({
        where: { productId: product2.id },
      });

      await cartService.addItem(user.id, {
        bundleId: bundle.id,
      }, 2);

      await orderService.checkout(user.id, { locationId: location.id });

      const finalInventory1 = await Inventory.findOne({
        where: { productId: product1.id },
      });
      const finalInventory2 = await Inventory.findOne({
        where: { productId: product2.id },
      });

      // Product1: 50 - (5*2) = 40
      // Product2: 30 - (3*2) = 24
      expect(finalInventory1?.quantity).toBe(initialInventory1!.quantity - 10);
      expect(finalInventory2?.quantity).toBe(initialInventory2!.quantity - 6);
    });
  });
});
