const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.define("orderitems", {
  id: {
    type: Sequelize.INTEGER(11),
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

  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  size: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  categorie: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },

  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  stock: {
    type: Sequelize.TINYINT,
    allowNull: true,
  },

  rating: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
});
