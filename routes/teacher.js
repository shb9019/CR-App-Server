const models = require('../models');
const express = require('express');
const router = express.Router();

const parseslot = (slot) => {
  let startTime = new Date();
  let endTime = new Date();

  switch(slot) {
    case 1: {
      startTime.setHours(8, 30, 0);
      endTime.setHours(9, 20, 0);
      break;
    }
    case 2: {
      startTime = new Date('9:20am');
      endTime = new Date('10:10am');
      break;
    }
    case 3: {
      startTime = new Date('10:30am');
      endTime = new Date('11:20am');
      break;
    }
    case 4: {
      startTime = new Date('11:20am');
      endTime = new Date('12:10pm');
      break;
    }
    case 5: {
      startTime = new Date('1:30pm');
      endTime = new Date('2:20pm');
      break;
    }
    case 6: {
      startTime = new Date('2:20pm');
      endTime = new Date('3:10pm');
      break;
    }
    case 7: {
      startTime = new Date('3:30pm');
      endTime = new Date('4:20pm');
      break;
    }
    case 8: {
      startTime = new Date('4:20pm');
      endTime = new Date('5:10pm');
      break;
    }
  }

  return { startTime, endTime };
}

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

    const teacherCourseDetails = await models.TeacherCourse.findOne({
      where: {
        courseid: studentClass.courseid,
        classid: studentClass.classid,
      }
    }); 

    const teacherDetails = await models.Teacher.findOne({
      where: {
        id: teacherCourseDetails.teacherid,
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
  for (const resultCourse of courses) {
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

router.post('/add', async (req, res) => {
  const { email, password, classname, coursename } = req.body;
  let { startTime, endTime } = parseslot(req.body.slot);

  console.log(startTime, endTime);

  const teacher = await authorizeTeacher(email, password);

  if (!teacher) {
    return res.status(401).json({
      type: 'Error',
      error: 'Invalid Credentials',
    });
  }

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
  const { email, password } = req.body;
  let scheduleid = Number(req.body.scheduleid);

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
    where: {
      id: req.body.scheduleid,
    }
  });

  return res.status(200).json({
    type: 'Success',
    message: 'Added to schedule successfully',
  });
});

module.exports = router;
