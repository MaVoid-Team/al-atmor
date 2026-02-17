"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS product_display_view;");

    await queryInterface.sequelize.query(`
      CREATE VIEW product_display_view AS
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.price,
        p.created_at,
        p.category_id,
        p.manufacturer_id,
        p.product_type_id,
        p.stock_status_override,
        p.image_url,
        p.image_public_id,
        m.name AS manufacturer_name,
        c.name AS category_name,
        pt.name AS product_type_name,
        COALESCE(i.quantity, 0) AS quantity,
        CASE 
          WHEN p.stock_status_override IS NOT NULL THEN CAST(p.stock_status_override AS TEXT)
          WHEN COALESCE(i.quantity, 0) > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END AS stock_label,
        CASE 
          WHEN p.stock_status_override = 'pre_order' THEN true
          WHEN COALESCE(i.quantity, 0) > 0 THEN true
          ELSE false
        END AS is_purchasable,
        p.search_vector,
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
    await queryInterface.sequelize.query("DROP VIEW IF EXISTS product_display_view;");

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
        p.image_url,
        p.image_public_id,
        m.name AS manufacturer_name,
        c.name AS category_name,
        pt.name AS product_type_name,
        COALESCE(i.quantity, 0) AS quantity,
        CASE 
          WHEN p.stock_status_override IS NOT NULL THEN CAST(p.stock_status_override AS TEXT)
          WHEN COALESCE(i.quantity, 0) > 0 THEN 'in_stock'
          ELSE 'out_of_stock'
        END AS stock_label,
        CASE 
          WHEN p.stock_status_override = 'pre_order' THEN true
          WHEN COALESCE(i.quantity, 0) > 0 THEN true
          ELSE false
        END AS is_purchasable,
        p.search_vector,
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
};
