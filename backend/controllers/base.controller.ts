import { Request, Response, NextFunction } from "express";
import { BaseService } from "../services/base.service";

export class BaseController<T> {
  constructor(protected service: any) {} // using any to bypass strict BaseService generic typing for now

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract & Validate defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // 2. Pass to service
      const result = await this.service.getAll(page, limit);

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getById(Number(req.params.id));
      if (!result) return res.status(404).json({ error: "Not Found" });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.update(Number(req.params.id), req.body);
      if (!result) return res.status(404).json({ error: "Not Found" });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this.service.delete(Number(req.params.id));
      if (!success) return res.status(404).json({ error: "Not Found" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
