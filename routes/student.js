const models = require('../models');
const express = require('express');
const router = express.Router();

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

  const matchingUsers = await models.Student.findAll({
    where: {
      rollno,
      password,
    },
  });

  if (matchingUsers.length === 0) {
    return res.status(400).json({
      type: 'Error',
      error: 'Invalid Roll No',
    });
  }

  const user = matchingUsers[0];

  req.session.isLoggedIn = true;
  req.session.rollno = rollno;
  req.session.semester = user.semester;
  req.session.classid = user.classid;
  req.session.studentid = user.id;
  req.session.isStudent = true;
  req.session.isTeacher = false;

  return res.status(200).json({
    type: 'Success',
    error: 'Login successful',
  });
});

router.post('/courses', async (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const studentCourses = await models.StudentCourse.findAll({
    where: {
      studentid: req.session.studentid,
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
  if (!req.session.isLoggedIn) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const studentCourses = await models.StudentCourse.findAll({
    where: {
      studentid: req.session.studentid,
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
