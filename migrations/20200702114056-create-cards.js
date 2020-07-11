'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Cards', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
    
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
    
      content: {
        type: Sequelize.STRING,
        allowNull: false
    
      },
      date: {
        type: Sequelize.DATE,
        allowNull: true
    
      },
      
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
      
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Cards');
  }
};