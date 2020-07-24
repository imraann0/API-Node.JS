const Sequelize = require('sequelize')
const db = require('../database/db')
const sequelize = require('../database/db')

module.exports = db.define('Comments', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  user_id : {
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
})
