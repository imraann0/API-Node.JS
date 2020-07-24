const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('usercomments', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  post_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  
})
