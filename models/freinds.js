const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Freinds', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  user_id1: {
    type: Sequelize.INTEGER,
    allowNull: false
  },

  user_id2: {
    type: Sequelize.INTEGER,
    allowNull: false

  },

  confirmed: {
    type: Sequelize.INTEGER,
    allowNull: true

  },

  blocked: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },

  date: {
    type: Sequelize.DATE,
    allowNull: true

  },

})
