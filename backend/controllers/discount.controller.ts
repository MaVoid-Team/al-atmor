import { Request, Response, NextFunction } from "express";
import discountService from "../services/discount.service";

class DiscountController {
  /**
   * GET /admin/discounts - Get all discount codes with pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const result = await discountService.getAll(activeOnly, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/discounts/:id - Get discount code by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const discount = await discountService.getById(id);

      if (!discount) {
        res.status(404).json({ error: "Discount code not found" });
        return;
      }

      res.json(discount);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/discounts - Create new discount code
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        code,
        type,
        value,
        minPurchase,
        maxUses,
        validFrom,
        validTo,
        active,
      } = req.body;

      if (!code || !type || value === undefined || !validFrom || !validTo) {
        res.status(400).json({
          error: "Code, type, value, validFrom, and validTo are required",
        });
        return;
      }

      const discount = await discountService.create({
        code,
        type,
        value,
        minPurchase,
        maxUses,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        active,
      });

      res.status(201).json(discount);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/discounts/:id - Update discount code
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const {
        code,
        type,
        value,
        minPurchase,
        maxUses,
        validFrom,
        validTo,
        active,
      } = req.body;

      const updateData: {
        code?: string;
        type?: "percentage" | "fixed";
        value?: number;
        minPurchase?: number | null;
        maxUses?: number | null;
        validFrom?: Date;
        validTo?: Date;
        active?: boolean;
      } = {
        code,
        type,
        value,
        minPurchase,
        maxUses,
        active,
      };

      if (validFrom) {
        updateData.validFrom = new Date(validFrom);
      }
      if (validTo) {
        updateData.validTo = new Date(validTo);
      }

      const discount = await discountService.update(id, updateData);

      res.json(discount);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/discounts/:id - Delete discount code (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await discountService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cart/apply-discount - Validate and apply discount code
   */
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, subtotal } = req.body;

      if (!code || subtotal === undefined) {
        res.status(400).json({
          error: "Code and subtotal are required",
        });
        return;
      }

      const validation = await discountService.validate(code, subtotal);

      if (!validation.valid) {
        res.status(400).json({
          valid: false,
          error: validation.error,
        });
        return;
      }

      const result = await discountService.apply(code, subtotal);

      res.json({
        valid: true,
        discountAmount: result.discountAmount,
        discountCode: {
          id: result.discountCode.id,
          code: result.discountCode.code,
          type: result.discountCode.type,
          value: result.discountCode.value,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /discounts/active - Get currently active discount codes
   */
  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const discounts = await discountService.getActiveDiscounts();
      res.json(discounts);
    } catch (error) {
      next(error);
    }
  }
}

export default new DiscountController();
