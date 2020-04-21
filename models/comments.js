const Sequelize = require('sequelize');
const db = require('../database/db');

module.exports = db.define('Comments',  {

    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },

    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    text: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    userRating: {
        type: Sequelize.INTEGER(11),
    }

});