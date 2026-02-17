import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../config/database";

// READ-ONLY Model
class ProductDisplayView extends Model<
  InferAttributes<ProductDisplayView>,
  InferCreationAttributes<ProductDisplayView>
> {
  declare id: number;
  declare name: string;
  declare sku: string;
  declare price: number;
  declare categoryId: number | null;
  declare manufacturerId: number | null;
  declare productTypeId: number | null;
  declare stockStatusOverride: string | null;
  declare quantity: number;
  declare stockLabel: "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
  declare isPurchasable: boolean;
  declare isBestSelling: boolean;
  declare salesCount30d: number;
  declare imageUrl: string | null;
  declare imagePublicId: string | null;
  declare createdAt: Date | null;
}

ProductDisplayView.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: DataTypes.STRING,
    sku: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    categoryId: { type: DataTypes.INTEGER, field: "category_id" },
    manufacturerId: { type: DataTypes.INTEGER, field: "manufacturer_id" },
    productTypeId: { type: DataTypes.INTEGER, field: "product_type_id" },
    stockStatusOverride: { type: DataTypes.STRING, field: "stock_status_override" },
    quantity: DataTypes.INTEGER,
    stockLabel: { type: DataTypes.STRING, field: "stock_label" },
    isPurchasable: { type: DataTypes.BOOLEAN, field: "is_purchasable" },
    isBestSelling: { type: DataTypes.BOOLEAN, field: "is_best_selling" },
    salesCount30d: { type: DataTypes.INTEGER, field: "sales_count_30d" },
    imageUrl: { type: DataTypes.STRING, field: "image_url" },
    imagePublicId: { type: DataTypes.STRING, field: "image_public_id" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "product_display_view",
    timestamps: false,
    freezeTableName: true, // Prevent pluralization
  }
);

export default ProductDisplayView;
