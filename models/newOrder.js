const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.define("neworders", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  order_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  ammount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
