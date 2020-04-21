const Sequelize = require('sequelize');
const db = require('../database/db');

module.exports = db.define('Location',  {

    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
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
        allowNull: false,
    },

    userId: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },

});