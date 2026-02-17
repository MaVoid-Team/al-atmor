import { BaseController } from "./base.controller";
import { ProductService } from "../services/product.service";
import { InventoryService } from "../services/inventory.service";
import { Request, Response, NextFunction } from "express";
import type { UploadedFile } from "../utils/cloudinary";

export class ProductController extends BaseController<ProductService> {
  private prodService: ProductService;
  private invService: InventoryService;

  constructor() {
    const service = new ProductService();
    super(service);
    this.prodService = service;
    this.invService = new InventoryService();
  }

  // Override Create to handle stock
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, initialStock } = this.normalizeProductPayload(req.body);
      const result = await this.prodService.createWithStock(
        data,
        initialStock,
        req.file as UploadedFile | undefined
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  // Override GetAll to use View
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.search as string;
      const sortByBestSelling = req.query.sortByBestSelling === "true";

      // Build filters from query params
      const filters: any = {};

      // Filter by purchasable status
      if (req.query.in_stock === "true") {
        filters.isPurchasable = true;
      }

      // Filter by best selling status
      if (req.query.isBestSelling === "true") {
        filters.isBestSelling = true;
      }

      // Filter by category
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }

      // Filter by manufacturer
      if (req.query.manufacturerId) {
        filters.manufacturerId = parseInt(req.query.manufacturerId as string);
      }

      // Filter by product type
      if (req.query.productTypeId) {
        filters.productTypeId = parseInt(req.query.productTypeId as string);
      }

      // Filter by stock label (in_stock, low_stock, out_of_stock, pre_order)
      if (req.query.stockLabel) {
        filters.stockLabel = req.query.stockLabel;
      }

      const result = await this.prodService.getAllProductsView(
        page,
        limit,
        filters,
        searchTerm,
        sortByBestSelling
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // Override GetOne to use populated view response
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.prodService.getProductViewById(
        Number(req.params.id)
      );
      if (!product) {
        return res.status(404).json({ error: "Not Found" });
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  };

  // Buy Action
  buy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.invService.decreaseStock(
        Number(req.params.id),
        1
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  // Admin Restock
  restock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity } = req.body;

      // Call addStock instead of adjustStock
      const result = await this.invService.addStock(
        Number(req.params.id),
        quantity
      );

      res.json({
        message: "Restock successful",
        newStockLevel: result.quantity,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data } = this.normalizeProductPayload(req.body);
      const result = await this.prodService.updateWithImage(
        Number(req.params.id),
        data,
        req.file as UploadedFile | undefined
      );
      if (!result) {
        return res.status(404).json({ error: "Not Found" });
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  private normalizeProductPayload(body: any) {
    const payload: any = { ...body };

    const numericFields = [
      "manufacturerId",
      "categoryId",
      "productTypeId",
    ];
    numericFields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== null) {
        const parsed = Number(payload[field]);
        payload[field] = Number.isNaN(parsed) ? null : parsed;
      }
    });

    if (payload.price !== undefined && payload.price !== null) {
      const parsedPrice = Number(payload.price);
      payload.price = Number.isNaN(parsedPrice) ? payload.price : parsedPrice;
    }

    if (payload.specs && typeof payload.specs === "string") {
      try {
        payload.specs = JSON.parse(payload.specs);
      } catch (error) {
        // leave specs as string to allow validation layer to reject
      }
    }

    const initialStock = (() => {
      if (payload.initialStock === undefined || payload.initialStock === null) {
        return 0;
      }
      const value = Number(payload.initialStock);
      return Number.isNaN(value) ? 0 : value;
    })();

    delete payload.initialStock;

    return { data: payload, initialStock };
  }
}
