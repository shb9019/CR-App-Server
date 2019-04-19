'use strict';
module.exports = (sequelize, DataTypes) => {
  var Student = sequelize.define('Student', {
    rollno: {
      type: DataTypes.STRING,
      isUnique: true,
      validate: {
        notEmpty: {
          args: true,
          msg: "Roll Number cannot be empty"
        },
        is: {
          args: ["^[0-9]+$", 'i'],
          msg: "Only numbers allowed in roll number"
        },
        max: {
          args: 9,
          msg: "Maximum 9 characters allowed in roll number"
        },
        min: {
          args: 9,
          msg: "Minimum 9 characters required in roll number"
        }
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      isUnique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    classid: {
      type: DataTypes.INTEGER,
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Student;
};
