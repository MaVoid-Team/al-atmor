"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "processing", "completed", "canceled"),
        allowNull: false,
        defaultValue: "pending",
      },
      payment_status: {
        type: Sequelize.ENUM("unpaid", "paid", "refunded"),
        allowNull: false,
        defaultValue: "unpaid",
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "SAR",
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tax: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      placed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("orders", ["user_id"]);
    await queryInterface.addIndex("orders", ["placed_at"]);

    await queryInterface.addColumn("order_items", "order_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "orders",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    await queryInterface.addIndex("order_items", ["order_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("order_items", ["order_id"]);
    await queryInterface.removeColumn("order_items", "order_id");

    await queryInterface.removeIndex("orders", ["user_id"]);
    await queryInterface.removeIndex("orders", ["placed_at"]);
    await queryInterface.dropTable("orders");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_payment_status";'
    );
  },
};
