'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add item_type to cart_items
    await queryInterface.addColumn('cart_items', 'item_type', {
      type: Sequelize.ENUM('product', 'bundle'),
      allowNull: false,
      defaultValue: 'product',
      comment: 'Type of item: product or bundle'
    });

    // Add bundle_id to cart_items
    await queryInterface.addColumn('cart_items', 'bundle_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'product_bundles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Reference to bundle if item_type is bundle'
    });

    // Make product_id nullable since bundle items won't have a product_id
    await queryInterface.changeColumn('cart_items', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addIndex('cart_items', ['bundle_id']);
    await queryInterface.addIndex('cart_items', ['item_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cart_items', 'bundle_id');
    await queryInterface.removeColumn('cart_items', 'item_type');
    
    // Restore product_id as non-nullable
    await queryInterface.changeColumn('cart_items', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
