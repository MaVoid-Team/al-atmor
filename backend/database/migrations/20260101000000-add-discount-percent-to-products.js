'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'discount_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Discount percentage (0-100) applied to product price',
      validate: {
        min: 0,
        max: 100
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'discount_percent');
  }
};
