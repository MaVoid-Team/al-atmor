import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../config/database";

export type DiscountType = "percentage" | "fixed";

class DiscountCode extends Model<
  InferAttributes<DiscountCode>,
  InferCreationAttributes<DiscountCode>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare type: DiscountType;
  declare value: number;
  declare minPurchase: number | null;
  declare maxUses: number | null;
  declare usedCount: CreationOptional<number>;
  declare validFrom: Date;
  declare validTo: Date;
  declare active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DiscountCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    minPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "min_purchase",
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "max_uses",
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "used_count",
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "valid_from",
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "valid_to",
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
    tableName: "discount_codes",
    timestamps: true,
    underscored: true,
  }
);

export default DiscountCode;
