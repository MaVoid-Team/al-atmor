'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create Products Table
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      sku: { type: Sequelize.STRING, unique: true, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      specs: { type: Sequelize.JSONB, defaultValue: {} },
      stock_status_override: { 
        type: Sequelize.ENUM('pre_order', 'discontinued', 'call_for_availability'), 
        allowNull: true 
      },
      manufacturer_id: {
        type: Sequelize.INTEGER,
        references: { model: 'manufacturers', key: 'id' }
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'categories', key: 'id' }
      },
      product_type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'product_types', key: 'id' }
      }
    });

    // 2. Create Inventory Table
    await queryInterface.createTable('inventories', {
      product_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE'
      },
      quantity: { type: Sequelize.INTEGER, defaultValue: 0 },
      reserved: { type: Sequelize.INTEGER, defaultValue: 0 }
    });

    // 3. Create the VIEW (With the FIX applied)
    const viewSQL = `
      CREATE VIEW product_display_view AS
      SELECT 
          p.id,
          p.name,
          p.price,
          p.stock_status_override,
          COALESCE(i.quantity, 0) as quantity,
          CASE 
              -- 🟢 THE FIX: Cast ENUM to TEXT here
              WHEN p.stock_status_override IS NOT NULL THEN CAST(p.stock_status_override AS TEXT)
              WHEN COALESCE(i.quantity, 0) > 5 THEN 'in_stock'
              WHEN COALESCE(i.quantity, 0) > 0 THEN 'low_stock'
              ELSE 'out_of_stock'
          END as stock_label,
          CASE 
              WHEN COALESCE(i.quantity, 0) > 0 OR p.stock_status_override = 'pre_order' THEN true
              ELSE false
          END as is_purchasable
      FROM products p
      LEFT JOIN inventories i ON p.id = i.product_id;
    `;
    
    // We drop first just in case
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');
    await queryInterface.sequelize.query(viewSQL);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');
    await queryInterface.dropTable('inventories');
    await queryInterface.dropTable('products');
    // We also need to drop the Enum type explicitly in Postgres
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_stock_status_override";');
  }
};