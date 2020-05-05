const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Rating', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false
  },

  UserId: {
    type: Sequelize.STRING,
    allowNull: false
  }
})
