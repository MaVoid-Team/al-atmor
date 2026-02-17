'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop just in case (Safety)
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');

    // 2. Create the View
    // Note: We use the CAST(... AS TEXT) fix we discovered earlier
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view');
  }
};