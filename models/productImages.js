const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.define("productimages", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },

  image_url: {
    type: Sequelize.STRING,
    allowNull: false
  }
});
