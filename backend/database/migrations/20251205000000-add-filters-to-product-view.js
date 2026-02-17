'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop and recreate the view with additional filter columns
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');

    await queryInterface.sequelize.query(`
      CREATE VIEW product_display_view AS
      SELECT 
          p.id,
          p.name,
          p.sku,
          p.price,
          p.category_id,
          p.manufacturer_id,
          p.product_type_id,
          p.stock_status_override,
          COALESCE(i.quantity, 0) as quantity,
          CASE 
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
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert to the original view without filter columns
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');

    await queryInterface.sequelize.query(`
      CREATE VIEW product_display_view AS
      SELECT 
          p.id,
          p.name,
          p.price,
          p.stock_status_override as stock_status_override,
          COALESCE(i.quantity, 0) as quantity,
          CASE 
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
    `);
  }
};
