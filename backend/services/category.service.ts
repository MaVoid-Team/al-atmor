import { BaseService } from "./base.service";
import { Category } from "../types";
import {
  deleteImageByPublicId,
  uploadImageBuffer,
  type UploadedFile,
} from "../utils/cloudinary";

export class CategoryService extends BaseService<Category> {
  constructor() {
    super(Category);
  }

  async getTree() {
    return await Category.findAll({
      where: { parentId: null },
      include: [
        {
          model: Category,
          as: "subcategories",
          include: [{ model: Category, as: "subcategories" }], // 3 levels deep
        },
      ],
    });
  }

  async createWithImage(data: any, file?: UploadedFile) {
    const payload = { ...data };
    if (file) {
      const asset = await uploadImageBuffer(file, "categories");
      payload.imageUrl = asset.url;
      payload.imagePublicId = asset.publicId;
    }
    return await Category.create(payload);
  }

  async updateWithImage(id: number, data: any, file?: UploadedFile) {
    const category = await Category.findByPk(id);
    if (!category) return null;

    const payload = { ...data };
    if (file) {
      await deleteImageByPublicId(category.imagePublicId);
      const asset = await uploadImageBuffer(file, "categories");
      payload.imageUrl = asset.url;
      payload.imagePublicId = asset.publicId;
    }

    return await category.update(payload);
  }
}
