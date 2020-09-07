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

  dob: {
    type: Sequelize.DATE,
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

  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false
  },

  location_id: {
    type: Sequelize.INTEGER(11),
    allowNull: true
  },

  display_pic: {
    type: Sequelize.STRING,
    allowNull: true
  },
  bio: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  trophy_level: {
    type: Sequelize.INTEGER,
    allowNull: true,

  },
  emaan_level: {
    type: Sequelize.INTEGER,
    allowNull: true,

  }
})
