'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create product_bundles table
    await queryInterface.createTable('product_bundles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Bundle name'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Bundle description'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Fixed bundle price in SAR'
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Bundle image URL'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this bundle is currently active'
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

    await queryInterface.addIndex('product_bundles', ['active']);

    // Create bundle_products junction table
    await queryInterface.createTable('bundle_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bundle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'product_bundles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity of this product in the bundle'
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

    await queryInterface.addIndex('bundle_products', ['bundle_id']);
    await queryInterface.addIndex('bundle_products', ['product_id']);
    await queryInterface.addIndex('bundle_products', ['bundle_id', 'product_id'], {
      unique: true,
      name: 'bundle_products_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bundle_products');
    await queryInterface.dropTable('product_bundles');
  }
};
