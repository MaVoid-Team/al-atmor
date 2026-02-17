import { ManufacturerService } from "../../services/manufacturer.service";
import { Manufacturer } from "../../types";

describe("ManufacturerService (BaseService)", () => {
  let service: ManufacturerService;

  beforeEach(() => {
    service = new ManufacturerService();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return paginated manufacturers", async () => {
      // 1. Setup Mock Data
      const mockRows = [
        { id: 1, name: "Asus" },
        { id: 2, name: "MSI" },
      ];

      // 2. Spy on the Model (BaseService uses findAndCountAll for pagination)
      const findAndCountAllSpy = jest
        .spyOn(Manufacturer, "findAndCountAll")
        .mockResolvedValue({ rows: mockRows, count: 2 } as any);

      // 3. Execute
      const result = await service.getAll();

      // 4. Assert
      expect(findAndCountAllSpy).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockRows,
        meta: {
          totalItems: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
    });
  });

  describe("getById", () => {
    it("should return a manufacturer when found", async () => {
      const mockItem = { id: 1, name: "Asus" };
      jest.spyOn(Manufacturer, "findByPk").mockResolvedValue(mockItem as any);

      const result = await service.getById(1);
      expect(result).toEqual(mockItem);
    });

    it("should return null when not found", async () => {
      jest.spyOn(Manufacturer, "findByPk").mockResolvedValue(null);

      const result = await service.getById(999);
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return a new manufacturer", async () => {
      const payload = { name: "Gigabyte", logoUrl: "http://img.com" };
      const createdItem = { id: 3, ...payload };

      const createSpy = jest
        .spyOn(Manufacturer, "create")
        .mockResolvedValue(createdItem as any);

      const result = await service.create(payload as any);

      expect(createSpy).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdItem);
    });
  });

  describe("delete", () => {
    it("should return true if deletion was successful", async () => {
      // Sequelize destroy returns number of rows deleted
      jest.spyOn(Manufacturer, "destroy").mockResolvedValue(1);

      const result = await service.delete(1);
      expect(result).toBe(true);
    });

    it("should return false if no rows were deleted", async () => {
      jest.spyOn(Manufacturer, "destroy").mockResolvedValue(0);

      const result = await service.delete(999);
      expect(result).toBe(false);
    });
  });
});
