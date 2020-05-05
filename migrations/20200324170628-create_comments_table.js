'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },

      text: {
        type: Sequelize.STRING,
        allowNull: false
      },

      userRating: {
        type: Sequelize.INTEGER(11)
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Comments')
  }
}
