'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {

      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    last_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    locationId: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
  },

  displayPic: {
      type: Sequelize.STRING,
      allowNull: true,
  },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE

    });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
