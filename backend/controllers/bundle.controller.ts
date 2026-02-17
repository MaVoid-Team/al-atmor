import { Request, Response, NextFunction } from "express";
import bundleService from "../services/bundle.service";
import { uploadImageBuffer, deleteImageByPublicId } from "../utils/cloudinary";
import type { UploadedFile } from "../utils/cloudinary";

class BundleController {
  /**
   * GET /admin/bundles - Get all bundles with pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string | undefined;

      const result = await bundleService.getAll(activeOnly, page, limit, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/bundles/:id - Get bundle by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const bundle = await bundleService.getById(id);

      if (!bundle) {
        res.status(404).json({ error: "Bundle not found" });
        return;
      }

      res.json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/bundles - Create new bundle with image upload
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, active, products } = req.body;

      if (
        !name ||
        price === undefined ||
        !products
      ) {
        res.status(400).json({
          error: "Name, price, and products are required",
        });
        return;
      }

      // Parse products if it's a string (from formdata)
      let parsedProducts;
      try {
        parsedProducts = typeof products === "string" ? JSON.parse(products) : products;
      } catch (e) {
        res.status(400).json({
          error: "Invalid products format. Must be valid JSON array.",
        });
        return;
      }

      if (!Array.isArray(parsedProducts)) {
        res.status(400).json({
          error: "Products must be an array",
        });
        return;
      }

      // Validate products array
      for (const product of parsedProducts) {
        if (!product.productId || !product.quantity) {
          res.status(400).json({
            error: "Each product must have productId and quantity",
          });
          return;
        }
      }

      // Handle image upload if provided
      let imageUrl: string | null = null;
      if (req.file) {
        const uploadedFile = req.file as UploadedFile;
        const uploadResult = await uploadImageBuffer(uploadedFile, "bundles");
        imageUrl = uploadResult.url;
      }

      const bundle = await bundleService.create({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        active: active === "true" || active === true,
        products: parsedProducts,
      });

      res.status(201).json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/bundles/:id - Update bundle with optional image upload
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, description, price, active, products } = req.body;

      // Parse products if it's a string (from formdata)
      let parsedProducts;
      if (products !== undefined) {
        try {
          parsedProducts = typeof products === "string" ? JSON.parse(products) : products;
        } catch (e) {
          res.status(400).json({
            error: "Invalid products format. Must be valid JSON array.",
          });
          return;
        }

        if (!Array.isArray(parsedProducts)) {
          res.status(400).json({
            error: "Products must be an array",
          });
          return;
        }

        // Validate products array
        for (const product of parsedProducts) {
          if (!product.productId || !product.quantity) {
            res.status(400).json({
              error: "Each product must have productId and quantity",
            });
            return;
          }
        }
      }

      // Handle image upload if provided
      let imageUrl: string | null | undefined = undefined;
      if (req.file) {
        // Get existing bundle to delete old image
        const existingBundle = await bundleService.getById(id);
        if (existingBundle?.imageUrl) {
          try {
            // Extract publicId from URL (format: .../folder/publicId.ext)
            const urlParts = existingBundle.imageUrl.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const publicIdWithFolder = urlParts.slice(-2).join('/').split('.')[0];
            await deleteImageByPublicId(publicIdWithFolder);
          } catch (err) {
            // Continue even if deletion fails
            console.error("Failed to delete old bundle image:", err);
          }
        }

        const uploadedFile = req.file as UploadedFile;
        const uploadResult = await uploadImageBuffer(uploadedFile, "bundles");
        imageUrl = uploadResult.url;
      }

      const bundle = await bundleService.update(id, {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        imageUrl,
        active: active !== undefined ? (active === "true" || active === true) : undefined,
        products: parsedProducts,
      });

      res.json(bundle);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/bundles/:id - Delete bundle (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await bundleService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /bundles/:id/stock - Check bundle stock availability
   */
  async checkStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const quantity = parseInt(req.query.quantity as string) || 1;

      const stockCheck = await bundleService.checkStock(id, quantity);

      res.json(stockCheck);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /bundles/:id/products - Get bundle products with inventory
   */
  async getBundleProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const products = await bundleService.getBundleProductsWithInventory(id);

      res.json(products);
    } catch (error) {
      next(error);
    }
  }
}

export default new BundleController();
