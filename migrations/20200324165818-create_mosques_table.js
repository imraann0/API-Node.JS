'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Mosques', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      pictures: {
        type: Sequelize.STRING
      },

      description: {
        type: Sequelize.STRING
      },

      locationId: {
        type: Sequelize.INTEGER(11),
        allowNull: false
      },

      facilities: {
        type: Sequelize.STRING
      },

      userRating: {
        type: Sequelize.INTEGER(11)
      },

      comments: {
        type: Sequelize.STRING
      },

      tags: {
        type: Sequelize.STRING
      },

      userId: {
        type: Sequelize.INTEGER(11)
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Mosques')
  }
}
