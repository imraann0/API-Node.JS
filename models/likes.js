const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('Likes', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  card_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  comment_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  }

})
