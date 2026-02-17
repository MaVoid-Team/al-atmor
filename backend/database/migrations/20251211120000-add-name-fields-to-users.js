'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'users',
        'first_name',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'users',
        'last_name',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '',
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'last_name', { transaction });
      await queryInterface.removeColumn('users', 'first_name', { transaction });
    });
  },
};
