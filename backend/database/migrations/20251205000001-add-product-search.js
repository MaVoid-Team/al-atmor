'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add search_vector column for full-text search
    await queryInterface.sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN search_vector tsvector;
    `);

    // Populate the search_vector column with existing data
    // Combines product name, sku, and related manufacturer/category names
    await queryInterface.sequelize.query(`
      UPDATE products p
      SET search_vector = to_tsvector('simple', 
        COALESCE(p.name, '') || ' ' || 
        COALESCE(p.sku, '') || ' ' ||
        COALESCE((SELECT m.name FROM manufacturers m WHERE m.id = p.manufacturer_id), '') || ' ' ||
        COALESCE((SELECT c.name FROM categories c WHERE c.id = p.category_id), '') || ' ' ||
        COALESCE((SELECT pt.name FROM product_types pt WHERE pt.id = p.product_type_id), '')
      );
    `);

    // Create GIN index for fast full-text search
    await queryInterface.sequelize.query(`
      CREATE INDEX products_search_vector_idx 
      ON products 
      USING GIN(search_vector);
    `);

    // Create trigger to auto-update search_vector on product changes
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION products_search_vector_update() 
      RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple',
          COALESCE(NEW.name, '') || ' ' || 
          COALESCE(NEW.sku, '') || ' ' ||
          COALESCE((SELECT m.name FROM manufacturers m WHERE m.id = NEW.manufacturer_id), '') || ' ' ||
          COALESCE((SELECT c.name FROM categories c WHERE c.id = NEW.category_id), '') || ' ' ||
          COALESCE((SELECT pt.name FROM product_types pt WHERE pt.id = NEW.product_type_id), '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER products_search_vector_trigger
      BEFORE INSERT OR UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION products_search_vector_update();
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop trigger and function
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
    `);
    
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS products_search_vector_update();
    `);

    // Drop index
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS products_search_vector_idx;
    `);

    // Drop column
    await queryInterface.sequelize.query(`
      ALTER TABLE products DROP COLUMN IF EXISTS search_vector;
    `);
  }
};
