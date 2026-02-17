'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('discount_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique discount code (e.g., "SUMMER2026")'
      },
      type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        comment: 'Type of discount: percentage or fixed amount'
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Discount value (percentage 0-100 or fixed amount in SAR)'
      },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Minimum purchase amount required to use this code'
      },
      max_uses: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum number of times this code can be used (null = unlimited)'
      },
      used_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times this code has been used'
      },
      valid_from: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Date from which this code becomes valid'
      },
      valid_to: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Date until which this code is valid'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this code is currently active'
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

    await queryInterface.addIndex('discount_codes', ['code']);
    await queryInterface.addIndex('discount_codes', ['active']);
    await queryInterface.addIndex('discount_codes', ['valid_from', 'valid_to']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('discount_codes');
  }
};
