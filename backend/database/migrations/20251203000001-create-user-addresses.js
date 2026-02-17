"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_addresses", {
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
      // Recipient name (e.g., "Mr. Mohammad S. ALI")
      recipient_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // Street address (e.g., "8228 King Abdulaziz Rd.")
      street_address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      // District (e.g., "2121 Alamal Dist.")
      district: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      // Postal code - 5 digits in Saudi Arabia (e.g., "12463")
      postal_code: {
        type: Sequelize.STRING(5),
        allowNull: false,
      },
      // City (e.g., "RIYADH")
      city: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      // Optional: Additional address number for building/unit
      building_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      // Optional: Secondary number (for additional address info)
      secondary_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      // Phone number for delivery contact
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      // Is this the default/primary address?
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // Label for the address (e.g., "Home", "Work", "Other")
      label: {
        type: Sequelize.STRING(30),
        allowNull: true,
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

    // Index for faster lookups by user
    await queryInterface.addIndex("user_addresses", ["user_id"]);
    
    // Index for finding default address quickly
    await queryInterface.addIndex("user_addresses", ["user_id", "is_default"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_addresses");
  },
};
