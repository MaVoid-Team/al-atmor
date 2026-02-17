'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'location_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to the location used for tax/shipping calculation'
    });

    await queryInterface.addIndex('orders', ['location_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'location_id');
  }
};
