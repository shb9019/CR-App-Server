'use strict';
module.exports = (sequelize, DataTypes) => {
  var TeacherCourse = sequelize.define('TeacherCourse', {
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacherid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return TeacherCourse;
};
