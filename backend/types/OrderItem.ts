import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import Product from "./Product";
import Order from "./Order";

class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<number>;
  declare productId: ForeignKey<Product["id"]>;
  declare orderId: CreationOptional<ForeignKey<Order["id"]> | null>;
  declare quantity: number;
  declare priceAtPurchase: number;
  declare createdAt: CreationOptional<Date>;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
      references: {
        model: "products",
        key: "id",
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "order_id",
      references: {
        model: "orders",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    priceAtPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "price_at_purchase",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
  },
  {
    sequelize,
    tableName: "order_items",
    underscored: true,
    timestamps: false,
  }
);

export default OrderItem;
