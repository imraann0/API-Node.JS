'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
    
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
    
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
    
      dob: {
        type: Sequelize.DATE,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
    
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
    
      location_id: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
    
      display_pic: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bio: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      trophy_level: {
        type: Sequelize.INTEGER,
        allowNull: true,
    
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
