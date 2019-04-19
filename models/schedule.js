'use strict';
module.exports = (sequelize, DataTypes) => {
  var Schedule = sequelize.define('Schedule', {
    classid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacherid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    starttime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endtime: {
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
  return Schedule;
};