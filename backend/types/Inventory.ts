import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";
import Product from "./Product";

class Inventory extends Model<
  InferAttributes<Inventory>,
  InferCreationAttributes<Inventory>
> {
  declare productId: ForeignKey<Product["id"]>;
  declare quantity: CreationOptional<number>;
  declare reserved: CreationOptional<number>;
}

Inventory.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: "products", key: "id" }, // specific referencing for migration safety
    },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    reserved: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, tableName: "inventories" }
);

export default Inventory;
