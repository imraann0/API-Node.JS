const Sequelize = require('sequelize');
const db = require('../database/db');

module.exports = db.define('location',  {

    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,

    },

    long: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    lat: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    name: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },

});