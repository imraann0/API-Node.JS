const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Challenges', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true

  },

  name: {
    type: Sequelize.STRING,
    allowNull: false
  },

  content: {
    type: Sequelize.STRING,
    allowNull: false

  },

  date: {
    type: Sequelize.DATE,
    allowNull: true

  }

})
