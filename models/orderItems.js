const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.define("orderitems", {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  order_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
