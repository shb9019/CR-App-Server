'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StudentCourses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      courseid: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      studentid: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numclasses: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      numbunks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('StudentCourses');
  }
};