const Sequelize = require('sequelize')
const db = require('../database/db')

module.exports = db.define('User', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  first_name: {
    type: Sequelize.STRING,
    allowNull: false
  },

  last_name: {
    type: Sequelize.STRING,
    allowNull: false
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false
  },

  locationId: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },

  displayPic: {
    type: Sequelize.STRING,
    allowNull: true
  },
  bio: {
    type: Sequelize.STRING,
    allowNull: true,
  },
})
