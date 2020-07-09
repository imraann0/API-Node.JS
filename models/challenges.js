const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Challenges', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  user_id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },

  name: {
    type: Sequelize.STRING,
    allowNull: true
  },

  content: {
    type: Sequelize.STRING,
    allowNull: true

  },

  date: {
    type: Sequelize.DATE,
    allowNull: true

  },

  type: {
    type: Sequelize.STRING,
    allowNull: false

  }

})
