"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Manufacturers
    await queryInterface.createTable("manufacturers", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      logo_url: { type: Sequelize.STRING },
    });

    // 2. Categories
    await queryInterface.createTable("categories", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true, allowNull: false },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "categories", key: "id" }, // Self-referencing FK
      },
    });

    // 3. Product Types
    await queryInterface.createTable("product_types", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      allowed_attributes: { type: Sequelize.JSONB, defaultValue: {} },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_types");
    await queryInterface.dropTable("categories");
    await queryInterface.dropTable("manufacturers");
  },
};
