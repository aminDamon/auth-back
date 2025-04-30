'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'system_ip', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: ''
    });

    await queryInterface.addColumn('users', 'serial_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'system_ip');
    await queryInterface.removeColumn('users', 'serial_number');
  }
}; 