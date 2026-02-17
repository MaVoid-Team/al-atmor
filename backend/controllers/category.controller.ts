import { BaseController } from "./base.controller";
import { CategoryService } from "../services/category.service";
import { Request, Response, NextFunction } from "express";
import type { UploadedFile } from "../utils/cloudinary";

export class CategoryController extends BaseController<CategoryService> {
  private catService: CategoryService;

  constructor() {
    const service = new CategoryService();
    super(service);
    this.catService = service;
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = this.normalizePayload(req.body);
      const result = await this.catService.createWithImage(
        payload,
        req.file as UploadedFile | undefined
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = this.normalizePayload(req.body);
      const result = await this.catService.updateWithImage(
        Number(req.params.id),
        payload,
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

  // Custom Endpoint for Tree View
  getTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await this.catService.getTree();
      res.json(tree);
    } catch (err) {
      next(err);
    }
  };

  private normalizePayload(body: any) {
    const payload: any = { ...body };
    if (payload.parentId !== undefined && payload.parentId !== null) {
      const parsed = Number(payload.parentId);
      payload.parentId = Number.isNaN(parsed) ? null : parsed;
    }
    return payload;
  }
}
