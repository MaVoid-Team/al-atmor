import { Transaction, Op } from "sequelize";
import DiscountCode, { DiscountType } from "../types/DiscountCode";

interface CreateDiscountCodeDTO {
  code: string;
  type: DiscountType;
  value: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  validFrom: Date;
  validTo: Date;
  active?: boolean;
}

interface UpdateDiscountCodeDTO {
  code?: string;
  type?: DiscountType;
  value?: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  validFrom?: Date;
  validTo?: Date;
  active?: boolean;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface AppliedDiscount {
  discountCode: DiscountCode;
  discountAmount: number;
}

class DiscountService {
  /**
   * Get all discount codes with optional filtering and pagination
   */
  async getAll(
    activeOnly: boolean = false,
    page?: number,
    limit?: number
  ): Promise<{ discounts: DiscountCode[]; total: number; page: number; totalPages: number }> {
    const where = activeOnly ? { active: true } : {};
    
    const options: any = {
      where,
      order: [["createdAt", "DESC"]],
    };

    if (page && limit) {
      const offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;
    }

    const { count, rows } = await DiscountCode.findAndCountAll(options);
    
    return {
      discounts: rows,
      total: count,
      page: page || 1,
      totalPages: limit ? Math.ceil(count / limit) : 1,
    };
  }

  /**
   * Get discount code by ID
   */
  async getById(id: number): Promise<DiscountCode | null> {
    return await DiscountCode.findByPk(id);
  }

  /**
   * Get discount code by code string
   */
  async getByCode(code: string): Promise<DiscountCode | null> {
    return await DiscountCode.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  /**
   * Create a new discount code
   */
  async create(
    data: CreateDiscountCodeDTO,
    transaction?: Transaction
  ): Promise<DiscountCode> {
    // Validate discount value
    if (data.type === "percentage") {
      if (data.value < 0 || data.value > 100) {
        throw new Error("Percentage discount must be between 0 and 100");
      }
    } else if (data.value < 0) {
      throw new Error("Fixed discount must be greater than or equal to 0");
    }

    // Validate date range
    if (data.validFrom >= data.validTo) {
      throw new Error("Valid from date must be before valid to date");
    }

    // Check for duplicate code
    const code = data.code.toUpperCase();
    const existing = await this.getByCode(code);
    if (existing) {
      throw new Error(`Discount code "${code}" already exists`);
    }

    return await DiscountCode.create(
      {
        code,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase ?? null,
        maxUses: data.maxUses ?? null,
        usedCount: 0,
        validFrom: data.validFrom,
        validTo: data.validTo,
        active: data.active !== undefined ? data.active : true,
      },
      { transaction }
    );
  }

  /**
   * Update discount code
   */
  async update(
    id: number,
    data: UpdateDiscountCodeDTO,
    transaction?: Transaction
  ): Promise<DiscountCode> {
    const discountCode = await this.getById(id);
    if (!discountCode) {
      throw new Error(`Discount code with ID ${id} not found`);
    }

    // Validate discount value if provided
    if (data.type && data.value !== undefined) {
      if (data.type === "percentage") {
        if (data.value < 0 || data.value > 100) {
          throw new Error("Percentage discount must be between 0 and 100");
        }
      } else if (data.value < 0) {
        throw new Error("Fixed discount must be greater than or equal to 0");
      }
    }

    // Validate date range if both provided
    if (data.validFrom && data.validTo && data.validFrom >= data.validTo) {
      throw new Error("Valid from date must be before valid to date");
    }

    // Check for duplicate code
    if (data.code && data.code.toUpperCase() !== discountCode.code) {
      const existing = await this.getByCode(data.code);
      if (existing) {
        throw new Error(
          `Discount code "${data.code.toUpperCase()}" already exists`
        );
      }
      data.code = data.code.toUpperCase();
    }

    await discountCode.update(data, { transaction });
    return discountCode;
  }

  /**
   * Delete discount code (soft delete)
   */
  async delete(id: number, transaction?: Transaction): Promise<void> {
    const discountCode = await this.getById(id);
    if (!discountCode) {
      throw new Error(`Discount code with ID ${id} not found`);
    }

    await discountCode.update({ active: false }, { transaction });
  }

  /**
   * Hard delete discount code
   */
  async hardDelete(id: number, transaction?: Transaction): Promise<void> {
    const discountCode = await this.getById(id);
    if (!discountCode) {
      throw new Error(`Discount code with ID ${id} not found`);
    }

    await discountCode.destroy({ transaction });
  }

  /**
   * Validate discount code for use
   */
  async validate(code: string, subtotal: number): Promise<ValidationResult> {
    const discountCode = await this.getByCode(code);

    if (!discountCode) {
      return { valid: false, error: "Invalid discount code" };
    }

    if (!discountCode.active) {
      return { valid: false, error: "This discount code is no longer active" };
    }

    const now = new Date();
    if (now < discountCode.validFrom) {
      return { valid: false, error: "This discount code is not yet valid" };
    }

    if (now > discountCode.validTo) {
      return { valid: false, error: "This discount code has expired" };
    }

    if (
      discountCode.maxUses !== null &&
      discountCode.usedCount >= discountCode.maxUses
    ) {
      return {
        valid: false,
        error: "This discount code has reached its maximum number of uses",
      };
    }

    if (
      discountCode.minPurchase !== null &&
      subtotal < Number(discountCode.minPurchase)
    ) {
      return {
        valid: false,
        error: `Minimum purchase of ${discountCode.minPurchase} SAR required`,
      };
    }

    return { valid: true };
  }

  /**
   * Apply discount code to subtotal (applies to original price)
   */
  async apply(code: string, subtotal: number): Promise<AppliedDiscount> {
    const validation = await this.validate(code, subtotal);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const discountCode = await this.getByCode(code);
    if (!discountCode) {
      throw new Error("Invalid discount code");
    }

    let discountAmount = 0;
    if (discountCode.type === "percentage") {
      discountAmount = this.roundCurrency(
        (subtotal * Number(discountCode.value)) / 100
      );
    } else {
      discountAmount = Math.min(Number(discountCode.value), subtotal);
    }

    return {
      discountCode,
      discountAmount: this.roundCurrency(discountAmount),
    };
  }

  /**
   * Increment usage count for a discount code
   */
  async incrementUsage(id: number, transaction?: Transaction): Promise<void> {
    const discountCode = await this.getById(id);
    if (!discountCode) {
      throw new Error(`Discount code with ID ${id} not found`);
    }

    await discountCode.increment("usedCount", { by: 1, transaction });
  }

  /**
   * Get active discount codes that are currently valid
   */
  async getActiveDiscounts(): Promise<DiscountCode[]> {
    const now = new Date();
    return await DiscountCode.findAll({
      where: {
        active: true,
        validFrom: { [Op.lte]: now },
        validTo: { [Op.gte]: now },
        [Op.or]: [
          { maxUses: null },
          { maxUses: { [Op.gt]: DiscountCode.sequelize!.col("used_count") } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Helper to round currency to 2 decimal places
   */
  private roundCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}

export default new DiscountService();
