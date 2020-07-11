'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Challengeusers', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      challenge_id: {
        type: Sequelize.STRING,
        allowNull: false
      },

      user_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
      
      

    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Challengeusers')
  }
}
