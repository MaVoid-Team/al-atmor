"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "categories",
      "categories_parent_id_fkey"
    );

    await queryInterface.addConstraint("categories", {
      fields: ["parent_id"],
      type: "foreign key",
      name: "categories_parent_id_fkey",
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
      "categories",
      "categories_parent_id_fkey"
    );

    await queryInterface.addConstraint("categories", {
      fields: ["parent_id"],
      type: "foreign key",
      name: "categories_parent_id_fkey",
      references: {
        table: "categories",
        field: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    });
  },
};
