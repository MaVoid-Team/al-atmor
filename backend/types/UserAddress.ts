import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import sequelize from "../config/database";
import User from "./User";

class UserAddress extends Model<
  InferAttributes<UserAddress>,
  InferCreationAttributes<UserAddress>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;

  // Egypt address fields
  declare recipientName: string;
  declare streetAddress: string;
  declare district: string;
  declare postalCode: string;
  declare city: string;

  // Optional fields
  declare buildingNumber: CreationOptional<string | null>;
  declare secondaryNumber: CreationOptional<string | null>;
  declare phoneNumber: CreationOptional<string | null>;
  declare isDefault: CreationOptional<boolean>;
  declare label: CreationOptional<string | null>;

  // Timestamps
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserAddress.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    recipientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "recipient_name",
    },
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "street_address",
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "postal_code",
      validate: {
        is: /^[0-9]{5}$/, // Egypt postal codes are exactly 5 digits
      },
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    buildingNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "building_number",
    },
    secondaryNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "secondary_number",
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_default",
    },
    label: {
      type: DataTypes.STRING(30),
      allowNull: true,
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
    tableName: "user_addresses",
    underscored: true,
  }
);

export default UserAddress;
