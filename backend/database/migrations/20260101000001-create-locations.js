'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Location name (e.g., "Riyadh", "Jeddah", "Eastern Province")'
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.15,
        comment: 'Tax rate as decimal (e.g., 0.15 for 15%)'
      },
      shipping_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.10,
        comment: 'Shipping rate as decimal (e.g., 0.10 for 10%)'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this location is currently active'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('locations', ['active']);
    await queryInterface.addIndex('locations', ['name']);

    // Seed default location matching current rates
    await queryInterface.bulkInsert('locations', [
      {
        name: 'Default Location',
        tax_rate: 0.15,
        shipping_rate: 0.10,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('locations');
  }
};
