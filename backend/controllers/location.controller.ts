import { Request, Response, NextFunction } from "express";
import locationService from "../services/location.service";

class LocationController {
  /**
   * GET /admin/locations - Get all locations
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const locations = await locationService.getAll(activeOnly);
      res.json(locations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/locations/:id - Get location by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const location = await locationService.getById(id);

      if (!location) {
        res.status(404).json({ error: "Location not found" });
        return;
      }

      res.json(location);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /admin/locations - Create new location
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, city, taxRate, shippingRate, active } = req.body;

      if (!name || !city || taxRate === undefined || shippingRate === undefined) {
        res.status(400).json({
          error: "Name, city, taxRate, and shippingRate are required",
        });
        return;
      }

      const location = await locationService.create({
        name,
        city,
        taxRate,
        shippingRate,
        active,
      });

      res.status(201).json(location);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /admin/locations/:id - Update location
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { name, city, taxRate, shippingRate, active } = req.body;

      const location = await locationService.update(id, {
        name,
        city,
        taxRate,
        shippingRate,
        active,
      });

      res.json(location);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /admin/locations/:id - Delete location (soft delete)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await locationService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /locations/city/:cityName - Get location by city name
   */
  async getByCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityName = req.params.cityName;
      const location = await locationService.getByCity(cityName);

      if (!location) {
        res.status(404).json({ error: "No active location found for this city" });
        return;
      }

      res.json(location);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /locations/cities/:cityName - Get all locations for a city
   */
  async getAllByCity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityName = req.params.cityName;
      const activeOnly = req.query.activeOnly !== "false";
      const locations = await locationService.getAllByCity(cityName, activeOnly);

      res.json(locations);
    } catch (error) {
      next(error);
    }
  }
}

export default new LocationController();
