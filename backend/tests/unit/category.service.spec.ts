import { CategoryService } from "../../services/category.service";
import { Category } from "../../types";
import {
  uploadImageBuffer,
  deleteImageByPublicId,
} from "../../utils/cloudinary";

jest.mock("../../utils/cloudinary", () => ({
  uploadImageBuffer: jest.fn(),
  deleteImageByPublicId: jest.fn(),
}));

describe("CategoryService", () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
    jest.clearAllMocks();
  });

  describe("getTree", () => {
    it("should fetch categories with correct nested includes", async () => {
      const mockTree = [{ id: 1, name: "Hardware", subcategories: [] }];
      const findAllSpy = jest
        .spyOn(Category, "findAll")
        .mockResolvedValue(mockTree as any);

      const result = await service.getTree();

      expect(result).toEqual(mockTree);

      // Verify strict recursive query structure
      expect(findAllSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
          include: expect.arrayContaining([
            expect.objectContaining({
              model: Category,
              as: "subcategories",
              include: expect.anything(), // Checking deeper level exists
            }),
          ]),
        })
      );
    });
  });

  describe("createWithImage", () => {
    it("uploads and persists image metadata when a file is present", async () => {
      const file: any = {
        buffer: Buffer.from("fake"),
        mimetype: "image/png",
        originalname: "cat.png",
      };
      (uploadImageBuffer as jest.Mock).mockResolvedValue({
        url: "https://cdn/image.png",
        publicId: "categories/123",
      });
      const createSpy = jest
        .spyOn(Category, "create")
        .mockResolvedValue({} as any);

      await service.createWithImage({ name: "Storage" }, file);

      expect(uploadImageBuffer).toHaveBeenCalledWith(file, "categories");
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Storage",
          imageUrl: "https://cdn/image.png",
          imagePublicId: "categories/123",
        })
      );
    });

    it("skips upload when file is missing", async () => {
      const createSpy = jest
        .spyOn(Category, "create")
        .mockResolvedValue({} as any);

      await service.createWithImage({ name: "Storage" });

      expect(uploadImageBuffer).not.toHaveBeenCalled();
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Storage" })
      );
    });
  });

  describe("updateWithImage", () => {
    it("replaces previous asset when a new file is uploaded", async () => {
      const file: any = {
        buffer: Buffer.from("fake"),
        mimetype: "image/png",
        originalname: "cat.png",
      };
      (uploadImageBuffer as jest.Mock).mockResolvedValue({
        url: "https://cdn/new.png",
        publicId: "categories/new",
      });
      const categoryInstance = {
        imagePublicId: "categories/old",
        update: jest.fn().mockResolvedValue({ id: 1 }),
      };
      jest.spyOn(Category, "findByPk").mockResolvedValue(categoryInstance as any);

      await service.updateWithImage(1, { name: "Updated" }, file);

      expect(deleteImageByPublicId).toHaveBeenCalledWith("categories/old");
      expect(uploadImageBuffer).toHaveBeenCalledWith(file, "categories");
      expect(categoryInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Updated",
          imageUrl: "https://cdn/new.png",
          imagePublicId: "categories/new",
        })
      );
    });

    it("returns null when category does not exist", async () => {
      jest.spyOn(Category, "findByPk").mockResolvedValue(null);

      const result = await service.updateWithImage(99, { name: "Ghost" });

      expect(result).toBeNull();
      expect(deleteImageByPublicId).not.toHaveBeenCalled();
    });
  });
});
