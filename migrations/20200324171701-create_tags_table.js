'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tags', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tags')
  }
}
