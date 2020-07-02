'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Freinds', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
    
      user_id1: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    
      user_id2: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    
      confirmed: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      blocked: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      date: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
            
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
      
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Freinds');
  }
};
