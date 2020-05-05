const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Tags', {
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
  }
})
