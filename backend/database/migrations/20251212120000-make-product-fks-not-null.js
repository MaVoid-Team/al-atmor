"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make sure existing products have non-null FK values by creating
    // default records and assigning them where NULL, then alter columns
    await queryInterface.sequelize.transaction(async (t) => {
      // 1) Ensure default manufacturer
      const [[existingManufacturer]] = await queryInterface.sequelize.query(
        `SELECT id FROM manufacturers WHERE name = 'Unknown Manufacturer' LIMIT 1`,
        { transaction: t }
      );
      let manufacturerId = existingManufacturer ? existingManufacturer.id : null;
      if (!manufacturerId) {
        const [insManufacturer] = await queryInterface.sequelize.query(
          `INSERT INTO manufacturers(name, logo_url) VALUES('Unknown Manufacturer', NULL) RETURNING id`,
          { transaction: t }
        );
        manufacturerId = insManufacturer[0].id;
      }

      // 2) Ensure default category
      const [[existingCategory]] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE name = 'Uncategorized' LIMIT 1`,
        { transaction: t }
      );
      let categoryId = existingCategory ? existingCategory.id : null;
      if (!categoryId) {
        const [insCategory] = await queryInterface.sequelize.query(
          `INSERT INTO categories(name, slug, parent_id) VALUES('Uncategorized','uncategorized', NULL) RETURNING id`,
          { transaction: t }
        );
        categoryId = insCategory[0].id;
      }

      // 3) Ensure default product type
      const [[existingProductType]] = await queryInterface.sequelize.query(
        `SELECT id FROM product_types WHERE name = 'General' LIMIT 1`,
        { transaction: t }
      );
      let productTypeId = existingProductType ? existingProductType.id : null;
      if (!productTypeId) {
        const [insProductType] = await queryInterface.sequelize.query(
          `INSERT INTO product_types(name, allowed_attributes) VALUES('General', '{}'::jsonb) RETURNING id`,
          { transaction: t }
        );
        productTypeId = insProductType[0].id;
      }

      // 4) Backfill NULLs in products to the defaults
      await queryInterface.sequelize.query(
        `UPDATE products SET manufacturer_id = ${manufacturerId} WHERE manufacturer_id IS NULL`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE products SET category_id = ${categoryId} WHERE category_id IS NULL`,
        { transaction: t }
      );
      await queryInterface.sequelize.query(
        `UPDATE products SET product_type_id = ${productTypeId} WHERE product_type_id IS NULL`,
        { transaction: t }
      );

      // 5) Alter columns to NOT NULL
      await queryInterface.changeColumn(
        'products',
        'manufacturer_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'manufacturers', key: 'id' },
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        'products',
        'category_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'categories', key: 'id' },
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        'products',
        'product_type_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'product_types', key: 'id' },
        },
        { transaction: t }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert columns to allow NULL again
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        'products',
        'manufacturer_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'manufacturers', key: 'id' },
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        'products',
        'category_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'categories', key: 'id' },
        },
        { transaction: t }
      );

      await queryInterface.changeColumn(
        'products',
        'product_type_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'product_types', key: 'id' },
        },
        { transaction: t }
      );
    });
  },
};
