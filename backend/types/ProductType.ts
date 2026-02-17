import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

class ProductType extends Model<
  InferAttributes<ProductType>,
  InferCreationAttributes<ProductType>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare allowedAttributes: Record<string, any>;
}

ProductType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    allowedAttributes: { type: DataTypes.JSONB, defaultValue: {} },
  },
  { sequelize, tableName: "product_types" }
);

export default ProductType;
