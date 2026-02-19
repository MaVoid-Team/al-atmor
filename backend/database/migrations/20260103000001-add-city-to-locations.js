'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('locations', 'city', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Unknown',
      comment: 'City name for this location (e.g., "Cairo", "Alexandria")'
    });

    await queryInterface.addIndex('locations', ['city']);

    // Update the default location with a city
    await queryInterface.sequelize.query(`
      UPDATE locations SET city = 'Cairo' WHERE name = 'Default Location';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('locations', 'city');
  }
};
