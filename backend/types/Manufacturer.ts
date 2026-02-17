import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

class Manufacturer extends Model<
  InferAttributes<Manufacturer>,
  InferCreationAttributes<Manufacturer>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare logoUrl: string | null;
}

Manufacturer.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: "manufacturers" }
);

export default Manufacturer;
