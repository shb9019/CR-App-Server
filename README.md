# CR App Server

A Node.js and Sequelize server for the app of CR App - A seamless and flawless intermediary between students and teachers.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Starting App

**Without Migrations**

```
npm install
npm start
```

**With Migrations**

```
npm install
node_modules/.bin/sequelize db:migrate
npm start
```

This will start the application and create an sqlite database in your app dir.
Just open [http://localhost:3000](http://localhost:3000).

## Running Tests

We have added some [Mocha](https://mochajs.org) based test. You can run them by `npm test`

## Features

[] Check all classes for students and teachers
[] Cancel classes for teachers
[] Request for an extra class
[] Attendance management for Students - Bunk Manager
[] Assignments Due dates list for students and teachers
[] Attachments in assignments also - PDFs and Images
[] Upcoming Exams Timings
[] Notifications of all changes to Students through push notifications (FCM)
[] (Future) Chat rooms for students and teachers
[] (Future) Anonymous feedback to teachers
[] (Future) SMS Notifications on class cancel
[] (Future) Assignments request for clarifications
[] (Future) Paper recorrection requests
[] Teachers broadcast message to students