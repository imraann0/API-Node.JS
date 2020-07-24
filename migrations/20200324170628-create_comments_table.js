'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Comments', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      user_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      card_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      content: {
        type: Sequelize.STRING,
        allowNull: false
      },


      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Comments')
  }
}
