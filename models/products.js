const Sequelize = require("sequelize");
const db = require("../database/db");

module.exports = db.define("Products", {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: Sequelize.STRING,
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
    allowNull: false,
  },

  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  stock: {
    type: Sequelize.INTEGER(11),
    allowNull: true,
  },
});
