'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Challenges', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
    
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
    
      content: {
        type: Sequelize.STRING,
        allowNull: true
    
      },
    
      date: {
        type: Sequelize.DATE,
        allowNull: true
    
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false
    
      },
            
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
      
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Challenges');
  }
};
