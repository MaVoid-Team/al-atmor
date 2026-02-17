import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Association,
  HasManyGetAssociationsMixin,
  NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import BundleProduct from "./BundleProduct";
import Product from "./Product";

class ProductBundle extends Model<
  InferAttributes<ProductBundle>,
  InferCreationAttributes<ProductBundle>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare imageUrl: string | null;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare getBundleProducts: HasManyGetAssociationsMixin<BundleProduct>;
  declare BundleProducts?: NonAttribute<BundleProduct[]>;

  declare static associations: {
    BundleProducts: Association<ProductBundle, BundleProduct>;
  };
}

ProductBundle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "image_url",
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "product_bundles",
    timestamps: true,
    underscored: true,
  }
);

export default ProductBundle;
