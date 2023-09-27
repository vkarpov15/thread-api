'use strict';

const express = require('express');

const app = express();
app.use(express.json());
app.use(function(req, res, next) {
  console.log(new Date(), req.method, req.url);
  next();
});

// Get a list of all threads
app.get('/threads', require('./routes/getThreads'));
// Create a new user
app.post('/users', require('./routes/postUsers'));
// Create a new thread
app.post('/threads', require('./routes/postThreads'));
// Comment on an existing thread
app.put('/threads/:id/comment', require('./routes/putComment'));
// Lock or unlock an existing thread
app.put('/threads/:id/lock', require('./routes/putLock'));
// Ban or unban an existing user
app.put('/users/:id/ban', require('./routes/putBan'));

app.use(function(err, req, res, next) {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
console.log('Listening on port 3000');