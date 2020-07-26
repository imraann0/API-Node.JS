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
    
      content: {
        type: Sequelize.STRING,
        allowNull: false
    
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      comments: {
        type: Sequelize.INTEGER,
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