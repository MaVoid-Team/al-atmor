import locationService from "../../services/location.service";
import Location from "../../types/Location";
import sequelize from "../../config/database";

describe("LocationService", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Location.destroy({ where: {}, force: true });
  });

  describe("create", () => {
    it("should create a new location with valid data", async () => {
      const locationData = {
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      };

      const location = await locationService.create(locationData);

      expect(location).toBeDefined();
      expect(location.name).toBe("Test Location");
      expect(location.city).toBe("Riyadh");
      expect(Number(location.taxRate)).toBeCloseTo(0.15);
      expect(Number(location.shippingRate)).toBeCloseTo(0.1);
      expect(location.active).toBe(true);
    });

    it("should throw error for duplicate location name", async () => {
      const locationData = {
        name: "Duplicate Location",
        city: "Jeddah",
        taxRate: 0.15,
        shippingRate: 0.10,
      };

      await locationService.create(locationData);

      await expect(locationService.create(locationData)).rejects.toThrow();
    });

    it("should throw error for invalid tax rate", async () => {
      const locationData = {
        name: "Invalid Tax",
        city: "Dammam",
        taxRate: 1.5, // Invalid: > 1
        shippingRate: 0.10,
      };

      await expect(locationService.create(locationData)).rejects.toThrow(
        "Tax rate must be between 0 and 1"
      );
    });

    it("should throw error for invalid shipping rate", async () => {
      const locationData = {
        name: "Invalid Shipping",
        city: "Mecca",
        taxRate: 0.15,
        shippingRate: -0.1, // Invalid: < 0
      };

      await expect(locationService.create(locationData)).rejects.toThrow(
        "Shipping rate must be between 0 and 1"
      );
    });
  });

  describe("getAll", () => {
    it("should return all locations when activeOnly is false", async () => {
      await locationService.create({
        name: "Active Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });
      await locationService.create({
        name: "Inactive Location",
        city: "Jeddah",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: false,
      });

      const locations = await locationService.getAll(false);

      expect(locations).toHaveLength(2);
    });

    it("should return only active locations when activeOnly is true", async () => {
      await locationService.create({
        name: "Active Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });
      await locationService.create({
        name: "Inactive Location",
        city: "Jeddah",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: false,
      });

      const locations = await locationService.getAll(true);

      expect(locations).toHaveLength(1);
      expect(locations[0].active).toBe(true);
    });
  });

  describe("getById", () => {
    it("should return location by ID", async () => {
      const location = await locationService.create({
        name: "Test Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      const found = await locationService.getById(location.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Location");
    });

    it("should return null for non-existent ID", async () => {
      const found = await locationService.getById(99999);

      expect(found).toBeNull();
    });
  });

  describe("getByName", () => {
    it("should return location by name", async () => {
      await locationService.create({
        name: "Unique Name",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      const found = await locationService.getByName("Unique Name");

      expect(found).toBeDefined();
      expect(found?.name).toBe("Unique Name");
    });

    it("should return null for non-existent name", async () => {
      const found = await locationService.getByName("Non-existent");

      expect(found).toBeNull();
    });
  });

  describe("getByCity", () => {
    it("should return active location by city name", async () => {
      await locationService.create({
        name: "Riyadh Zone 1",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });
      await locationService.create({
        name: "Riyadh Zone 2",
        city: "Riyadh",
        taxRate: 0.12,
        shippingRate: 0.08,
        active: false,
      });

      const found = await locationService.getByCity("Riyadh");

      expect(found).toBeDefined();
      expect(found?.city).toBe("Riyadh");
      expect(found?.name).toBe("Riyadh Zone 1"); // Only active one
    });

    it("should return null for non-existent city", async () => {
      const found = await locationService.getByCity("NonExistentCity");

      expect(found).toBeNull();
    });
  });

  describe("getAllByCity", () => {
    it("should return all active locations for a city", async () => {
      await locationService.create({
        name: "Riyadh Zone 1",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });
      await locationService.create({
        name: "Riyadh Zone 2",
        city: "Riyadh",
        taxRate: 0.12,
        shippingRate: 0.08,
        active: true,
      });
      await locationService.create({
        name: "Riyadh Zone 3",
        city: "Riyadh",
        taxRate: 0.10,
        shippingRate: 0.05,
        active: false,
      });
      await locationService.create({
        name: "Jeddah Zone 1",
        city: "Jeddah",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });

      const locations = await locationService.getAllByCity("Riyadh", true);

      expect(locations).toHaveLength(2);
      expect(locations.every(l => l.city === "Riyadh")).toBe(true);
      expect(locations.every(l => l.active)).toBe(true);
    });

    it("should return all locations for city when activeOnly is false", async () => {
      await locationService.create({
        name: "Riyadh Zone 1",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: true,
      });
      await locationService.create({
        name: "Riyadh Zone 2",
        city: "Riyadh",
        taxRate: 0.12,
        shippingRate: 0.08,
        active: false,
      });

      const locations = await locationService.getAllByCity("Riyadh", false);

      expect(locations).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should update location successfully", async () => {
      const location = await locationService.create({
        name: "Original Name",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      const updated = await locationService.update(location.id, {
        name: "Updated Name",
        city: "Jeddah",
        taxRate: 0.20,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.city).toBe("Jeddah");
      expect(Number(updated?.taxRate)).toBeCloseTo(0.2);
      expect(Number(updated?.shippingRate)).toBeCloseTo(0.1); // Unchanged
    });

    it("should throw error when updating with duplicate name", async () => {
      const location1 = await locationService.create({
        name: "Location 1",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });
      await locationService.create({
        name: "Location 2",
        city: "Jeddah",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      await expect(
        locationService.update(location1.id, { name: "Location 2" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should soft delete location", async () => {
      const location = await locationService.create({
        name: "To Delete",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      await locationService.delete(location.id);

      // Should not appear in regular queries
      const found = await locationService.getById(location.id);
      expect(found?.active).toBe(false);
    });
  });

  describe("calculateTax", () => {
    it("should calculate tax correctly", async () => {
      const location = await locationService.create({
        name: "Tax Test",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      const tax = locationService.calculateTax(100, location);

      expect(tax).toBe(15);
    });

    it("should return 0 for inactive location", async () => {
      const location = await locationService.create({
        name: "Inactive Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: false,
      });

      const tax = locationService.calculateTax(100, location);

      expect(tax).toBe(0);
    });
  });

  describe("calculateShipping", () => {
    it("should calculate shipping correctly", async () => {
      const location = await locationService.create({
        name: "Shipping Test",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
      });

      const shipping = locationService.calculateShipping(100, location);

      expect(shipping).toBe(10);
    });

    it("should return 0 for inactive location", async () => {
      const location = await locationService.create({
        name: "Inactive Location",
        city: "Riyadh",
        taxRate: 0.15,
        shippingRate: 0.10,
        active: false,
      });

      const shipping = locationService.calculateShipping(100, location);

      expect(shipping).toBe(0);
    });
  });
});
