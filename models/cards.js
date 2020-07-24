const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Cards', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true

  },

  content: {
    type: Sequelize.STRING,
    allowNull: false

  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  likes: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  comments: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  


})
