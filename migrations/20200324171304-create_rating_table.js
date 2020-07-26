'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Likes', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      card_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Likes')
  }
}
