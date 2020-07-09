const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Challengeusers', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  challenge_id: {
    type: Sequelize.STRING,
    allowNull: false
  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false

  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

})
