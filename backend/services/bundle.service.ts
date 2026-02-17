import { Transaction, Op } from "sequelize";
import ProductBundle from "../types/ProductBundle";
import BundleProduct from "../types/BundleProduct";
import Product from "../types/Product";
import Inventory from "../types/Inventory";

interface CreateBundleDTO {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  active?: boolean;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

interface UpdateBundleDTO {
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
  active?: boolean;
  products?: Array<{
    productId: number;
    quantity: number;
  }>;
}

interface BundleWithProducts extends ProductBundle {
  BundleProducts?: Array<
    BundleProduct & {
      Product?: Product;
    }
  >;
}

interface StockCheckResult {
  available: boolean;
  insufficientProducts?: Array<{
    productId: number;
    productName: string;
    required: number;
    available: number;
  }>;
}

class BundleService {
  /**
   * Get all bundles with optional filtering and pagination
   */
  async getAll(
    activeOnly: boolean = false,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ bundles: BundleWithProducts[]; total: number; page: number; totalPages: number }> {
    const where: any = activeOnly ? { active: true } : {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // If pagination params provided, use them
    const options: any = {
      where,
      include: [
        {
          model: BundleProduct,
          as: "BundleProducts",
          include: [
            {
              model: Product,
              as: "Product",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (page && limit) {
      const offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;
    }

    const { count, rows } = await ProductBundle.findAndCountAll(options);

    return {
      bundles: rows as BundleWithProducts[],
      total: count,
      page: page || 1,
      totalPages: limit ? Math.ceil(count / limit) : 1,
    };
  }

  /**
   * Get bundle by ID with products
   */
  async getById(id: number): Promise<BundleWithProducts | null> {
    return (await ProductBundle.findByPk(id, {
      include: [
        {
          model: BundleProduct,
          as: "BundleProducts",
          include: [
            {
              model: Product,
              as: "Product",
            },
          ],
        },
      ],
    })) as BundleWithProducts | null;
  }

  /**
   * Create a new bundle
   */
  async create(
    data: CreateBundleDTO,
    transaction?: Transaction
  ): Promise<BundleWithProducts> {
    const t = transaction || (await ProductBundle.sequelize!.transaction());

    try {
      // Validate price
      if (data.price <= 0) {
        throw new Error("Bundle price must be greater than 0");
      }

      // Validate products
      if (!data.products || data.products.length === 0) {
        throw new Error("Bundle must contain at least one product");
      }

      // Check for duplicate products
      const productIds = data.products.map((p) => p.productId);
      const uniqueProductIds = new Set(productIds);
      if (productIds.length !== uniqueProductIds.size) {
        throw new Error("Bundle contains duplicate products");
      }

      // Validate all products exist
      const products = await Product.findAll({
        where: { id: productIds },
      });

      if (products.length !== data.products.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Products not found: ${missingIds.join(", ")}`);
      }

      // Create bundle
      const bundle = await ProductBundle.create(
        {
          name: data.name,
          description: data.description ?? null,
          price: data.price,
          imageUrl: data.imageUrl ?? null,
          active: data.active !== undefined ? data.active : true,
        },
        { transaction: t }
      );

      // Create bundle products
      const bundleProducts = data.products.map((p) => ({
        bundleId: bundle.id,
        productId: p.productId,
        quantity: p.quantity,
      }));

      await BundleProduct.bulkCreate(bundleProducts, { transaction: t });

      if (!transaction) {
        await t.commit();
      }

      // Reload with associations
      return (await this.getById(bundle.id))!;
    } catch (error) {
      if (!transaction && t) {
        try {
          await t.rollback();
        } catch (rollbackError) {
          // Ignore rollback error if transaction already finished
        }
      }
      throw error;
    }
  }

  /**
   * Update bundle
   */
  async update(
    id: number,
    data: UpdateBundleDTO,
    transaction?: Transaction
  ): Promise<BundleWithProducts> {
    const t = transaction || (await ProductBundle.sequelize!.transaction());

    try {
      const bundle = await this.getById(id);
      if (!bundle) {
        throw new Error(`Bundle with ID ${id} not found`);
      }

      // Validate price if provided
      if (data.price !== undefined && data.price <= 0) {
        throw new Error("Bundle price must be greater than 0");
      }

      // Update bundle fields
      await bundle.update(
        {
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          active: data.active,
        },
        { transaction: t }
      );

      // Update products if provided
      if (data.products) {
        // Validate products
        if (data.products.length === 0) {
          throw new Error("Bundle must contain at least one product");
        }

        // Check for duplicate products
        const productIds = data.products.map((p) => p.productId);
        const uniqueProductIds = new Set(productIds);
        if (productIds.length !== uniqueProductIds.size) {
          throw new Error("Bundle contains duplicate products");
        }

        // Validate all products exist
        const products = await Product.findAll({
          where: { id: productIds },
        });

        if (products.length !== data.products.length) {
          const foundIds = products.map((p) => p.id);
          const missingIds = productIds.filter((id) => !foundIds.includes(id));
          throw new Error(`Products not found: ${missingIds.join(", ")}`);
        }

        // Delete existing bundle products
        await BundleProduct.destroy({
          where: { bundleId: id },
          transaction: t,
        });

        // Create new bundle products
        const bundleProducts = data.products.map((p) => ({
          bundleId: id,
          productId: p.productId,
          quantity: p.quantity,
        }));

        await BundleProduct.bulkCreate(bundleProducts, { transaction: t });
      }

      if (!transaction) {
        await t.commit();
      }

      // Reload with associations
      return (await this.getById(id))!;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Delete bundle (soft delete)
   */
  async delete(id: number, transaction?: Transaction): Promise<void> {
    const bundle = await this.getById(id);
    if (!bundle) {
      throw new Error(`Bundle with ID ${id} not found`);
    }

    await bundle.update({ active: false }, { transaction });
  }

  /**
   * Hard delete bundle
   */
  async hardDelete(id: number, transaction?: Transaction): Promise<void> {
    const t = transaction || (await ProductBundle.sequelize!.transaction());

    try {
      const bundle = await this.getById(id);
      if (!bundle) {
        throw new Error(`Bundle with ID ${id} not found`);
      }

      // Delete bundle products first (cascade should handle this, but being explicit)
      await BundleProduct.destroy({
        where: { bundleId: id },
        transaction: t,
      });

      // Delete bundle
      await bundle.destroy({ transaction: t });

      if (!transaction) {
        await t.commit();
      }
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Check if bundle has sufficient stock for all products
   */
  async checkStock(
    bundleId: number,
    quantity: number = 1
  ): Promise<StockCheckResult> {
    const bundle = await this.getById(bundleId);
    if (!bundle) {
      throw new Error(`Bundle with ID ${bundleId} not found`);
    }

    if (!bundle.BundleProducts || bundle.BundleProducts.length === 0) {
      throw new Error(`Bundle with ID ${bundleId} has no products`);
    }

    const insufficientProducts: StockCheckResult["insufficientProducts"] = [];

    for (const bundleProduct of bundle.BundleProducts) {
      const product = bundleProduct.Product;
      if (!product) continue;

      const requiredQuantity = bundleProduct.quantity * quantity;

      // Get inventory
      const inventory = await Inventory.findOne({
        where: { productId: product.id },
      });

      const availableQuantity = inventory ? inventory.quantity : 0;

      if (availableQuantity < requiredQuantity) {
        insufficientProducts.push({
          productId: product.id,
          productName: product.name,
          required: requiredQuantity,
          available: availableQuantity,
        });
      }
    }

    return {
      available: insufficientProducts.length === 0,
      insufficientProducts:
        insufficientProducts.length > 0 ? insufficientProducts : undefined,
    };
  }

  /**
   * Get bundle products with their current inventory
   */
  async getBundleProductsWithInventory(bundleId: number): Promise<
    Array<{
      product: Product;
      bundleQuantity: number;
      availableStock: number;
    }>
  > {
    const bundle = await this.getById(bundleId);
    if (!bundle) {
      throw new Error(`Bundle with ID ${bundleId} not found`);
    }

    if (!bundle.BundleProducts) {
      return [];
    }

    const result = [];
    for (const bundleProduct of bundle.BundleProducts) {
      const product = bundleProduct.Product;
      if (!product) continue;

      const inventory = await Inventory.findOne({
        where: { productId: product.id },
      });

      result.push({
        product,
        bundleQuantity: bundleProduct.quantity,
        availableStock: inventory ? inventory.quantity : 0,
      });
    }

    return result;
  }
}

export default new BundleService();
