import { Transaction } from "sequelize";
import Location from "../types/Location";

interface CreateLocationDTO {
  name: string;
  city: string;
  taxRate: number;
  shippingRate: number;
  active?: boolean;
}

interface UpdateLocationDTO {
  name?: string;
  city?: string;
  taxRate?: number;
  shippingRate?: number;
  active?: boolean;
}

class LocationService {
  /**
   * Get all locations with optional filtering
   */
  async getAll(activeOnly: boolean = false): Promise<Location[]> {
    const where = activeOnly ? { active: true } : {};
    return await Location.findAll({
      where,
      order: [["name", "ASC"]],
    });
  }

  /**
   * Get location by ID
   */
  async getById(id: number): Promise<Location | null> {
    return await Location.findByPk(id);
  }

  /**
   * Get location by name
   */
  async getByName(name: string): Promise<Location | null> {
    return await Location.findOne({ where: { name } });
  }

  /**
   * Get location by city name
   */
  async getByCity(city: string): Promise<Location | null> {
    return await Location.findOne({ 
      where: { city, active: true },
      order: [["createdAt", "ASC"]]
    });
  }

  /**
   * Get all locations for a specific city
   */
  async getAllByCity(city: string, activeOnly: boolean = true): Promise<Location[]> {
    const where: any = { city };
    if (activeOnly) {
      where.active = true;
    }
    return await Location.findAll({
      where,
      order: [["name", "ASC"]]
    });
  }

  /**
   * Create a new location
   */
  async create(
    data: CreateLocationDTO,
    transaction?: Transaction
  ): Promise<Location> {
    // Validate rates
    if (data.taxRate < 0 || data.taxRate > 1) {
      throw new Error("Tax rate must be between 0 and 1");
    }
    if (data.shippingRate < 0 || data.shippingRate > 1) {
      throw new Error("Shipping rate must be between 0 and 1");
    }

    // Check for duplicate name
    const existing = await this.getByName(data.name);
    if (existing) {
      throw new Error(`Location with name "${data.name}" already exists`);
    }

    return await Location.create(
      {
        name: data.name,
        city: data.city,
        taxRate: data.taxRate,
        shippingRate: data.shippingRate,
        active: data.active !== undefined ? data.active : true,
      },
      { transaction }
    );
  }

  /**
   * Update location
   */
  async update(
    id: number,
    data: UpdateLocationDTO,
    transaction?: Transaction
  ): Promise<Location> {
    const location = await this.getById(id);
    if (!location) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Validate rates if provided
    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 1)) {
      throw new Error("Tax rate must be between 0 and 1");
    }
    if (
      data.shippingRate !== undefined &&
      (data.shippingRate < 0 || data.shippingRate > 1)
    ) {
      throw new Error("Shipping rate must be between 0 and 1");
    }

    // Check for duplicate name
    if (data.name && data.name !== location.name) {
      const existing = await this.getByName(data.name);
      if (existing) {
        throw new Error(`Location with name "${data.name}" already exists`);
      }
    }

    await location.update(data, { transaction });
    return location;
  }

  /**
   * Delete location (soft delete by setting active to false)
   */
  async delete(id: number, transaction?: Transaction): Promise<void> {
    const location = await this.getById(id);
    if (!location) {
      throw new Error(`Location with ID ${id} not found`);
    }

    // Soft delete by setting active to false
    await location.update({ active: false }, { transaction });
  }

  /**
   * Hard delete location (use with caution)
   */
  async hardDelete(id: number, transaction?: Transaction): Promise<void> {
    const location = await this.getById(id);
    if (!location) {
      throw new Error(`Location with ID ${id} not found`);
    }

    await location.destroy({ transaction });
  }

  /**
   * Calculate tax for a given amount
   */
  calculateTax(amount: number, location: Location): number {
    if (!location.active) return 0;
    return this.roundCurrency(amount * Number(location.taxRate));
  }

  /**
   * Calculate shipping for a given amount
   */
  calculateShipping(amount: number, location: Location): number {
    if (!location.active) return 0;
    return this.roundCurrency(amount * Number(location.shippingRate));
  }

  /**
   * Helper to round currency to 2 decimal places
   */
  private roundCurrency(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}

export default new LocationService();
