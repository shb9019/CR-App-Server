const models = require('./index');

'use strict';
module.exports = (sequelize, DataTypes) => {
  var StudentCourse = sequelize.define('StudentCourse', {
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numclasses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    numbunks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return StudentCourse;
};
