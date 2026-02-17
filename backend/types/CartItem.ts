import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import sequelize from "../config/database";
import Cart from "./Cart";
import Product from "./Product";
import type ProductBundle from "./ProductBundle";

export type CartItemType = "product" | "bundle";

class CartItem extends Model<
  InferAttributes<CartItem>,
  InferCreationAttributes<CartItem>
> {
  declare id: CreationOptional<number>;
  declare cartId: ForeignKey<Cart["id"]>;
  declare productId: ForeignKey<Product["id"]> | null;
  declare bundleId: ForeignKey<ProductBundle["id"]> | null;
  declare itemType: CreationOptional<CartItemType>;
  declare quantity: number;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations (for eager loading)
  declare Product?: NonAttribute<Product>;
  declare Bundle?: NonAttribute<ProductBundle>;
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "cart_id",
      references: {
        model: "carts",
        key: "id",
      },
    },
    itemType: {
      type: DataTypes.ENUM("product", "bundle"),
      allowNull: false,
      defaultValue: "product",
      field: "item_type",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_id",
      references: {
        model: "products",
        key: "id",
      },
    },
    bundleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "bundle_id",
      references: {
        model: "product_bundles",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
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
    tableName: "cart_items",
    underscored: true,
  }
);

export default CartItem;
