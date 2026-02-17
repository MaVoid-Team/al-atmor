import {
  Model,
  ModelStatic,
  WhereOptions,
  Attributes,
  CreationAttributes,
} from "sequelize";

export class BaseService<T extends Model> {
  // We accept the Sequelize Model into the constructor
  constructor(protected model: ModelStatic<T>) {}

  async create(data: CreationAttributes<T>): Promise<T> {
    return await this.model.create(data);
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    options: {
      where?: WhereOptions<T>;
      include?: any;
      order?: any;
      attributes?: any;
    } = {}
  ) {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      ...options,
      limit,
      offset,
      // Default order to ensure consistent pagination (e.g., by ID descending)
      order: options.order || [["id", "DESC"]],
      attributes: options.attributes,
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  async getById(id: number): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  async update(id: number, data: Partial<Attributes<T>>): Promise<T | null> {
    const item = await this.model.findByPk(id);
    if (!item) return null;
    return await item.update(data);
  }

  async delete(id: number): Promise<boolean> {
    const deletedCount = await this.model.destroy({ where: { id } as any });
    return deletedCount > 0;
  }
}
