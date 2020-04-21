'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Location', {

      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },

    long: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    lat: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE

    });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Location');
  }
};
