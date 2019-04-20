const models = require('../models');
const express = require('express');
const router = express.Router();

const authorizeStudent = async (rollno, password) => {
  const matchingStudents = await models.Student.findOne({
    where: {
      rollno,
      password,
    },
  });

  return matchingStudents;
};

router.post('/login', async (req, res) => {
  const { rollno, password } = req.body;
  if (!rollno || rollno === '') {
    return res.status(400).json({
      type: 'Error',
      error: 'Roll Number cannot be empty',
    });
  } else if (!password || password === '') {
    return res.status(400).json({
      type: 'Error',
      error: 'Password cannot be empty',
    });
  }

  const student = await authorizeStudent(rollno, password);

  if (student) {
    return res.status(200).json({
      type: 'Success',
      message: 'Login successful',
      details: student,
    });
  } else {
    return res.status(401).json({
      type: 'Error',
      message: 'Invalid Credentials',
    });
  }
});

router.post('/courses', async (req, res) => {
  const { rollno, password } = req.body;

  const student = await authorizeStudent(rollno, password);

  if (!student) {
    return res.status(401).json({
      type: 'Error',
      message: 'Invalid Credentials',
    });
  }

  const studentCourses = await models.StudentCourse.findAll({
    where: {
      studentid: student.id,
    },
  });

  const result = [];
  for (const studentCourse of studentCourses) {
    const courseDetails = await models.Course.findOne({
      where: {
        id: studentCourse.courseid,
      },
    });
    result.push({
      courseName: courseDetails.coursename,
      courseCredits: courseDetails.credits,
      numClasses: studentCourse.numclasses,
      numBunks: studentCourse.numbunks,
    });
  }

  return res.status(200).json({
    type: 'Success',
    courses: result,
  });
});

router.post('/schedule', async (req, res) => {
  const { rollno, password } = req.body;

  const student = await authorizeStudent(rollno, password);

  if (!student) {
    return res.status(401).json({
      type: 'Error',
      message: 'Invalid Credentials',
    });
  }

  const studentCourses = await models.StudentCourse.findAll({
    where: {
      studentid: student.studentid,
    },
  });

  const classes = [];
  for (const studentCourse of studentCourses) {
    const studentClasses = await models.Schedule.findAll({
      where: {
        classid: req.session.classid,
        courseid: studentCourse.courseid,
      }
    });
    console.log(studentClasses);
    for (const studentClass of studentClasses) {
      console.log(studentClass.courseid);
      const courseDetails = await models.Course.findOne({
        where: {
          id: studentClass.courseid,
        },
      });
      classes.push({
        coursename: courseDetails.coursename,
        teacher: studentClass.teacherid,
        starttime: studentClass.starttime,
        endtime: studentClass.endtime,
      });
    }
  }

  return res.status(200).json({
    type: 'Success',
    classes: classes,
  });
});

module.exports = router;
