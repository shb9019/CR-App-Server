const models = require('../models');
const express = require('express');
const router = express.Router();

const authorizeTeacher = async (email, password) => {
  const matchingTeacher = await models.Teacher.findOne({
    where: {
      email,
      password,
    },
  });

  return matchingTeacher;
};

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

  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
    });
  }

  return res.status(200).json({
    type: 'Success',
    error: 'Login successful',
  });
});

router.post('/classes', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
    });
  }

  const classes = await models.Class.findAll({});

  const result = [];
  for (const resultClass of classes) {
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

router.post('/schedule', async (req, res) => {
  const {
    email,
    password,
    classname
  } = req.body;
  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
    });
  }

  const classes = [];
  const classDetails = await models.Class.findOne({
    where: {
      classname,
    }
  });

  const studentClasses = await models.Schedule.findAll({
    where: {
      classid: classDetails.id,
    }
  });

  for (const studentClass of studentClasses) {
    const courseDetails = await models.Course.findOne({
      where: {
        id: studentClass.courseid,
      },
    });

    const teacherDetails = await models.Teacher.findOne({
      where: {
        id: studentClass.teacherid,
      },
    });

    classes.push({
      scheduleid: String(studentClass.id),
      coursename: courseDetails.coursename,
      teacherid: studentClass.teacherid,
      teachername: teacherDetails.name,
      starttime: studentClass.starttime,
      endtime: studentClass.endtime,
    });
  }

  return res.status(200).json({
    type: 'Success',
    classes: classes,
  });
});

router.post('/courses', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
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

router.post('/cancel', async (req, res) => {
  const { email, password, scheduleid } = req.body;
  scheduleid = Number(scheduleid);
  console.log(scheduleid);
  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
    });
  }

  const scheduleElement = await models.Schedule.findOne({
    where: {
      id: scheduleid
    }
  });

  if (!scheduleElement) {
    return res.status(200).json({
      type: 'Success',
      message: 'Schedule Element does not exist',
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
