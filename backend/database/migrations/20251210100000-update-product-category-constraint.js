"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "products",
      "products_category_id_fkey"
    );

    await queryInterface.addConstraint("products", {
      fields: ["category_id"],
      type: "foreign key",
      name: "products_category_id_fkey",
      references: {
        table: "categories",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "products",
      "products_category_id_fkey"
    );

    await queryInterface.addConstraint("products", {
      fields: ["category_id"],
      type: "foreign key",
      name: "products_category_id_fkey",
      references: {
        table: "categories",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
