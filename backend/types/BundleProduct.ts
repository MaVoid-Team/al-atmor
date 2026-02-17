import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  Association,
  BelongsToGetAssociationMixin,
  NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import ProductBundle from "./ProductBundle";
import Product from "./Product";

class BundleProduct extends Model<
  InferAttributes<BundleProduct>,
  InferCreationAttributes<BundleProduct>
> {
  declare id: CreationOptional<number>;
  declare bundleId: ForeignKey<ProductBundle["id"]>;
  declare productId: ForeignKey<Product["id"]>;
  declare quantity: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare getProduct: BelongsToGetAssociationMixin<Product>;
  declare getBundle: BelongsToGetAssociationMixin<ProductBundle>;
  declare Product?: NonAttribute<Product>;
  declare Bundle?: NonAttribute<ProductBundle>;

  declare static associations: {
    Product: Association<BundleProduct, Product>;
    Bundle: Association<BundleProduct, ProductBundle>;
  };

}

BundleProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bundleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "bundle_id",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "bundle_products",
    timestamps: true,
    underscored: true,
  }
);

export default BundleProduct;
