import discountService from "../../services/discount.service";
import DiscountCode from "../../types/DiscountCode";
import sequelize from "../../config/database";

describe("DiscountService", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await DiscountCode.destroy({ where: {}, force: true });
  });

  describe("create", () => {
    it("should create a percentage discount", async () => {
      const discountData = {
        code: "SAVE20",
        type: "percentage" as const,
        value: 20,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      };

      const discount = await discountService.create(discountData);

      expect(discount).toBeDefined();
      expect(discount.code).toBe("SAVE20");
      expect(discount.type).toBe("percentage");
      expect(Number(discount.value)).toBeCloseTo(20);
    });

    it("should create a fixed discount", async () => {
      const discountData = {
        code: "FIXED50",
        type: "fixed" as const,
        value: 50,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
      };

      const discount = await discountService.create(discountData);

      expect(discount).toBeDefined();
      expect(discount.type).toBe("fixed");
      expect(Number(discount.value)).toBeCloseTo(50);
    });

    it("should throw error for duplicate code", async () => {
      const discountData = {
        code: "DUPLICATE",
        type: "percentage" as const,
        value: 10,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
      };

      await discountService.create(discountData);

      await expect(discountService.create(discountData)).rejects.toThrow();
    });
  });

  describe("validate", () => {
    it("should validate active discount within date range", async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await discountService.create({
        code: "VALID",
        type: "percentage",
        value: 10,
        validFrom: yesterday,
        validTo: tomorrow,
        active: true,
      });

      const result = await discountService.validate("VALID", 100);

      expect(result.valid).toBe(true);
    });

    it("should reject inactive discount", async () => {
      await discountService.create({
        code: "INACTIVE",
        type: "percentage",
        value: 10,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: false,
      });

      const result = await discountService.validate("INACTIVE", 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("This discount code is no longer active");
    });

    it("should reject expired discount", async () => {
      const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2);
      const expired = new Date(Date.now() - 1000 * 60 * 60);

      await discountService.create({
        code: "EXPIRED",
        type: "percentage",
        value: 10,
        validFrom: yesterday,
        validTo: expired,
        active: true,
      });

      const result = await discountService.validate("EXPIRED", 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("This discount code has expired");
    });

    it("should reject discount not yet valid", async () => {
      const tomorrow = new Date(Date.now() + 1000 * 60 * 60);
      const nextWeek = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      await discountService.create({
        code: "FUTURE",
        type: "percentage",
        value: 10,
        validFrom: tomorrow,
        validTo: nextWeek,
        active: true,
      });

      const result = await discountService.validate("FUTURE", 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("This discount code is not yet valid");
    });

    it("should reject discount below minimum purchase", async () => {
      await discountService.create({
        code: "MINPURCHASE",
        type: "percentage",
        value: 10,
        minPurchase: 100,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      const result = await discountService.validate("MINPURCHASE", 50);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Minimum purchase of 100.00 SAR required");
    });

    it("should reject discount at max uses", async () => {
      const discount = await discountService.create({
        code: "MAXUSES",
        type: "percentage",
        value: 10,
        maxUses: 5,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      // Simulate max uses reached
      discount.usedCount = 5;
      await discount.save();

      const result = await discountService.validate("MAXUSES", 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "This discount code has reached its maximum number of uses"
      );
    });

    it("should reject non-existent discount", async () => {
      const result = await discountService.validate("NONEXISTENT", 100);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid discount code");
    });
  });

  describe("apply", () => {
    it("should apply percentage discount correctly", async () => {
      await discountService.create({
        code: "PERCENT20",
        type: "percentage",
        value: 20,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      const result = await discountService.apply("PERCENT20", 100);

      expect(result.discountAmount).toBeCloseTo(20);
      expect(result.discountCode.code).toBe("PERCENT20");
    });

    it("should apply fixed discount correctly", async () => {
      await discountService.create({
        code: "FIXED50",
        type: "fixed",
        value: 50,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      const result = await discountService.apply("FIXED50", 100);

      expect(result.discountAmount).toBeCloseTo(50);
    });

    it("should cap fixed discount at subtotal", async () => {
      await discountService.create({
        code: "FIXED100",
        type: "fixed",
        value: 100,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      const result = await discountService.apply("FIXED100", 50);

      expect(result.discountAmount).toBeCloseTo(50); // Capped at subtotal
    });

    it("should throw error for invalid discount", async () => {
      await expect(discountService.apply("INVALID", 100)).rejects.toThrow(
        "Invalid discount code"
      );
    });
  });

  describe("incrementUsage", () => {
    it("should increment usage count", async () => {
      const discount = await discountService.create({
        code: "USAGE",
        type: "percentage",
        value: 10,
        validFrom: new Date(Date.now() - 1000 * 60 * 60),
        validTo: new Date(Date.now() + 1000 * 60 * 60),
        active: true,
      });

      expect(discount.usedCount).toBe(0);

      await discountService.incrementUsage(discount.id);

      const updated = await discountService.getById(discount.id);
      expect(updated?.usedCount).toBe(1);
    });
  });

  describe("getActiveDiscounts", () => {
    it("should return only active and valid discounts", async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Active and valid
      await discountService.create({
        code: "ACTIVE1",
        type: "percentage",
        value: 10,
        validFrom: yesterday,
        validTo: tomorrow,
        active: true,
      });

      // Inactive
      await discountService.create({
        code: "INACTIVE",
        type: "percentage",
        value: 10,
        validFrom: yesterday,
        validTo: tomorrow,
        active: false,
      });

      // Expired
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await discountService.create({
        code: "EXPIRED",
        type: "percentage",
        value: 10,
        validFrom: twoDaysAgo,
        validTo: yesterday,
        active: true,
      });

      const activeDiscounts = await discountService.getActiveDiscounts();

      expect(activeDiscounts).toHaveLength(1);
      expect(activeDiscounts[0].code).toBe("ACTIVE1");
    });
  });

  describe("getAll", () => {
    it("should return all discounts when activeOnly is false", async () => {
      const activeFrom = new Date(Date.now() - 1000 * 60 * 60);
      const activeTo = new Date(Date.now() + 1000 * 60 * 60);

      await discountService.create({
        code: "ACTIVE",
        type: "percentage",
        value: 10,
        validFrom: activeFrom,
        validTo: activeTo,
        active: true,
      });
      await discountService.create({
        code: "INACTIVE",
        type: "percentage",
        value: 10,
        validFrom: activeFrom,
        validTo: activeTo,
        active: false,
      });

      const result = await discountService.getAll(false);

      expect(result.discounts).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should return only active discounts when activeOnly is true", async () => {
      const activeFrom = new Date(Date.now() - 1000 * 60 * 60);
      const activeTo = new Date(Date.now() + 1000 * 60 * 60);

      await discountService.create({
        code: "ACTIVE",
        type: "percentage",
        value: 10,
        validFrom: activeFrom,
        validTo: activeTo,
        active: true,
      });
      await discountService.create({
        code: "INACTIVE",
        type: "percentage",
        value: 10,
        validFrom: activeFrom,
        validTo: activeTo,
        active: false,
      });

      const result = await discountService.getAll(true);

      expect(result.discounts).toHaveLength(1);
      expect(result.discounts[0].code).toBe("ACTIVE");
    });

    it("should handle pagination correctly", async () => {
      const activeFrom = new Date(Date.now() - 1000 * 60 * 60);
      const activeTo = new Date(Date.now() + 1000 * 60 * 60);

      // Create 5 discounts
      for (let i = 1; i <= 5; i++) {
        await discountService.create({
          code: `CODE${i}`,
          type: "percentage",
          value: 10,
          validFrom: activeFrom,
          validTo: activeTo,
          active: true,
        });
      }

      // Get first page with 2 items
      const page1 = await discountService.getAll(false, 1, 2);
      expect(page1.discounts).toHaveLength(2);
      expect(page1.total).toBe(5);
      expect(page1.page).toBe(1);
      expect(page1.totalPages).toBe(3);

      // Get second page
      const page2 = await discountService.getAll(false, 2, 2);
      expect(page2.discounts).toHaveLength(2);
      expect(page2.page).toBe(2);
    });
  });
});
