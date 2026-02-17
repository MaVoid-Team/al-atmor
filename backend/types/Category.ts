import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";

class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare parentId: CreationOptional<ForeignKey<number> | null>;
  declare imageUrl: CreationOptional<string | null>;
  declare imagePublicId: CreationOptional<string | null>;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    imageUrl: { type: DataTypes.STRING, allowNull: true, field: "image_url" },
    imagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "image_public_id",
    },
  },
  { sequelize, tableName: "categories" }
);

export default Category;
