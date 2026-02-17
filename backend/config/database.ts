import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Keep console clean
    define: {
      timestamps: false, // customized per model if needed
      underscored: true, // Maps camelCase (TS) to snake_case (DB)
    },
  }
);

export default sequelize;
