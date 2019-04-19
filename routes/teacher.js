const models = require('../models');
const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || email === '') {
    return res.status(400).json({
      type: 'Error',
      error: 'Email cannot be empty',
    });
  } else if (!password || password === '') {
    return res.status(400).json({
      type: 'Error',
      error: 'Password cannot be empty',
    });
  }

  const matchingTeachers = await models.Teacher.findAll({
    where: {
      email,
      password,
    },
  });

  if (matchingTeachers.length === 0) {
    return res.status(400).json({
      type: 'Error',
      error: 'Invalid Email and Password',
    });
  }

  const user = matchingTeachers[0];

  req.session.isLoggedIn = true;
  req.session.email = email;
  req.session.teacherName = user.name;
  req.session.teacherid = user.id;
  req.session.isStudent = false;
  req.session.isTeacher = true;

  return res.status(200).json({
    type: 'Success',
    error: 'Login successful',
  });
});

router.get('/schedule', async (req, res) => {
  if (!req.session.isLoggedIn || !req.session.isTeacher) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const teacherClasses = await models.Schedule.findAll({
    where: {
      teacherid: req.session.teacherid,
    },
  });

  const classes = [];
  for (const teacherClass of teacherClasses) {
    const courseDetails = await models.Course.findOne({
      where: {
        id: teacherClass.courseid,
      },
    });

    const classDetails = await models.Class.findOne({
      where: {
        id: teacherClass.classid,
      },
    });

    classes.push({
      classname: classDetails.classname,
      coursename: courseDetails.coursename,
      starttime: teacherClass.starttime,
      endtime: teacherClass.endtime,
    });
  }

  return res.status(200).json({
    type: 'Success',
    classes,
  });
});

router.get('/classes', async (req, res) => {
  if (!req.session.isLoggedIn || !req.session.isTeacher) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const classes = await models.Class.findAll({});

  const result = [];
  for (const resultClass in classes) {
    result.push({
      id: resultClass.id,
      classname: resultClass.classname,
    });
  }

  return res.status(200).json({
    type: 'Success',
    classes: result,
  });
});

router.get('/courses', async (req, res) => {
  if (!req.session.isLoggedIn || !req.session.isTeacher) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const courses = await models.Course.findAll({});

  const result = [];
  for (const resultCourse in courses) {
    result.push({
      id: resultCourse.id,
      coursename: resultCourse.coursename,
    });
  }

  return res.status(200).json({
    type: 'Success',
    courses: result,
  });
});

router.get('/add', async (req, res) => {
  if (!req.session.isLoggedIn || !req.session.isTeacher) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const { classid, courseid, starttime, endtime } = req.body;

  starttime = new Date(starttime);
  endtime = new Date(endtime);

  if (!classid) {
    return res.status(400).json({
      type: 'Error',
      error: 'Class not found',
    });
  }

  if (!courseid) {
    return res.status(400).json({
      type: 'Error',
      error: 'Course not found',
    });
  }

  if (!starttime || !endtime || starttime >= endtime) {
    return res.status(400).json({
      type: 'Error',
      error: 'Invalid times',
    });
  }

  const teacherClasses = await models.Schedule.findAll({
    where: {
      teacherid: req.session.teacherid,
    },
  });

  for (const teacherClass of teacherClasses) {
    const startTime = new Date(teacherClass.starttime);
    const endTime = new Date(teacherClass.endtime);

    if ((starttime > startTime && starttime < endTime)
      || (endtime > startTime && endtime < endTime)) {
      return res.status(400).json({
        type: 'Error',
        error: 'Already have a class in the interval',
      });
    }
  }

  const studentClasses = await models.Schedule.findAll({
    where: {
      classid,
      courseid,
    },
  });

  for (const studentClass of studentClasses) {
    const startTime = new Date(studentClass.starttime);
    const endTime = new Date(studentClass.endtime);

    if ((starttime > startTime && starttime < endTime) ||
      (endtime > startTime && endtime < endTime)) {
      return res.status(400).json({
        type: 'Error',
        error: 'Already have a class in the interval',
      });
    }
  }

  await models.Schedule.create({
    teacherid: req.session.teacherid,
    classid,
    courseid,
    starttime,
    endtime,
  });

  return res.status(200).json({
    type: 'Success',
    message: 'Added to schedule successfully',
  });
});

router.get('/cancel', async (req, res) => {
  if (!req.session.isLoggedIn || !req.session.isTeacher) {
    return res.status(400).json({
      type: 'Error',
      error: 'User not logged in',
    });
  }

  const scheduleElement = await models.Schedule.findOne({
    where: {
      id: req.body.scheduleid
    }
  });

  if (!scheduleElement) {
    return res.status(200).json({
      type: 'Success',
      message: 'Schedule Element does not exist',
    });
  }

  if (scheduleElement.teacherid !== req.session.teacherid) {
    return res.status(200).json({
      type: 'Success',
      message: 'Schedule Element does not belong to you',
    });
  }

  await models.Schedule.destroy({
    id: req.body.scheduleid,
  });

  return res.status(200).json({
    type: 'Success',
    message: 'Added to schedule successfully',
  });
});

module.exports = router;
