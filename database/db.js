const Sequelize = require('sequelize')
const settings = require('../config/config')

console.log(process.env.ENV_VARIABLE)

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: '127.0.0.1',
    dialect: 'mysql',

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

module.exports = sequelize
