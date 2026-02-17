'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing view
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view;');

    // Recreate the view with is_best_selling field
    // A product is considered "best selling" if it has 10+ sales in the last 30 days
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
        m.name AS manufacturer_name,
        c.name AS category_name,
        pt.name AS product_type_name,
        COALESCE(i.quantity, 0) AS quantity,
        CASE 
          WHEN COALESCE(i.quantity, 0) > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END AS stock_label,
        CASE 
          WHEN COALESCE(i.quantity, 0) > 0 THEN true
          ELSE false
        END AS is_purchasable,
        p.search_vector,
        -- Calculate if product is best selling (10+ sales in last 30 days)
        CASE 
          WHEN COALESCE(
            (SELECT SUM(oi.quantity) 
             FROM order_items oi 
             WHERE oi.product_id = p.id 
             AND oi.created_at >= NOW() - INTERVAL '30 days'
            ), 0
          ) >= 10 THEN true
          ELSE false
        END AS is_best_selling,
        -- Total sales for sorting
        COALESCE(
          (SELECT SUM(oi.quantity) 
           FROM order_items oi 
           WHERE oi.product_id = p.id 
           AND oi.created_at >= NOW() - INTERVAL '30 days'
          ), 0
        ) AS sales_count_30d
      FROM products p
      LEFT JOIN inventories i ON p.id = i.product_id
      LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_types pt ON p.product_type_id = pt.id;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the view with new fields
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS product_display_view;');

    // Recreate the old view without is_best_selling
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
        m.name AS manufacturer_name,
        c.name AS category_name,
        pt.name AS product_type_name,
        COALESCE(i.quantity, 0) AS quantity,
        CASE 
          WHEN COALESCE(i.quantity, 0) > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END AS stock_label,
        CASE 
          WHEN COALESCE(i.quantity, 0) > 0 THEN true
          ELSE false
        END AS is_purchasable,
        p.search_vector
      FROM products p
      LEFT JOIN inventories i ON p.id = i.product_id
      LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_types pt ON p.product_type_id = pt.id;
    `);
  }
};
