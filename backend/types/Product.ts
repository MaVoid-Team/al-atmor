import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import Manufacturer from "./Manufacturer";
import Category from "./Category";
import ProductType from "./ProductType";

class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare sku: string;
  declare price: number;
  declare discountPercent: CreationOptional<number | null>;
  declare specs: Record<string, any>;
  declare stockStatusOverride: CreationOptional<
    "pre_order" | "discontinued" | null
  >;
  declare imageUrl: CreationOptional<string | null>;
  declare imagePublicId: CreationOptional<string | null>;

  // Foreign Keys
  declare manufacturerId: ForeignKey<Manufacturer["id"]>;
  declare categoryId: ForeignKey<Category["id"]>;
  declare productTypeId: ForeignKey<ProductType["id"]>;
}

Product.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, unique: true, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "discount_percent",
    },
    specs: { type: DataTypes.JSONB, defaultValue: {} },
    stockStatusOverride: {
      type: DataTypes.ENUM(
        "pre_order",
        "discontinued",
        "call_for_availability"
      ),
      allowNull: true,
    },
    imageUrl: { type: DataTypes.STRING, allowNull: true, field: "image_url" },
    imagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "image_public_id",
    },
    // Make relationships required (NOT NULL)
    manufacturerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'manufacturer_id',
      references: { model: 'manufacturers', key: 'id' },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: { model: 'categories', key: 'id' },
    },
    productTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_type_id',
      references: { model: 'product_types', key: 'id' },
    },
  },
  { sequelize, tableName: "products" }
);

export default Product;
