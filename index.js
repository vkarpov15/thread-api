'use strict';

const { Oso } = require('oso-cloud');
const assert = require('assert');
const express = require('express');

const apiKey = process.env.OSO_CLOUD_API_KEY;
assert.ok(apiKey, 'Must set OSO_CLOUD_API_KEY environment variable');
const oso = new Oso('https://cloud.osohq.com', apiKey, { debug: { print: true } });

const app = express();
app.use(express.json());
app.use(function(req, res, next) {
  console.log(new Date(), req.method, req.url);
  next();
});

const threads = [];
const users = [];
app.get('/threads', function(req, res) {
  res.json({ threads });
});

app.post('/users', async function(req, res) {
  if (req.body.id == null) {
    throw new Error('User must have an id');
  }
  if (users.find(user => user.id === req.body.id)) {
    throw new Error(`Duplicate user id ${req.body.id}`);
  }
  const user = {
    name: 'John Smith',
    banned: false,
    roles: [],
    ...req.body
  };
  users.push(user);

  if (user.roles.includes('admin')) {
    await oso.tell('has_role', { type: 'User', id: req.body.id }, 'admin');
  }
  await oso.bulk(
    [['is_banned', { type: 'User', id: user.id }, null]],
    [['is_banned', { type: 'User', id: user.id }, { type: 'Boolean', id: user.banned + '' }]]
  );

  res.json({ user });
});

app.post('/threads', async function(req, res) {
  if (req.body.id == null) {
    throw new Error('Thread must have an id');
  }
  if (threads.find(thread => thread.id === req.body.id)) {
    throw new Error(`Duplicate thread id ${req.body.id}`);
  }
  const thread = {
    title: null,
    comments: [],
    locked: false,
    userId: req.headers.authorization,
    ...req.body
  };
  threads.push(thread);
  await oso.bulk(
    [['is_locked', { type: 'Thread', id: thread.id }, null]],
    [['is_locked', { type: 'Thread', id: thread.id }, { type: 'Boolean', id: !!thread.locked + '' }]]
  );
  res.json({ thread });
});

app.put('/threads/:id/comment', async function(req, res) {
  const thread = threads.find(thread => thread.id === req.params.id);
  if (!thread) {
    throw new Error(`Thread ${req.params.id} not found`);
  }

  const authorized = await oso.authorize(
    { type: 'User', id: req.headers.authorization },
    'comment',
    { type: 'Thread', id: req.params.id }
  );
  if (!authorized) {
    throw new Error(`Not allowed to comment on thread ${req.params.id}`);
  }

  thread.comments.push(req.body);
  res.json({ thread });
});

app.put('/threads/:id/lock', async function(req, res) {
  const thread = threads.find(thread => thread.id === req.params.id);
  if (!thread) {
    throw new Error(`Thread ${req.params.id} not found`);
  }
  const authorized = await oso.authorize(
    { type: 'User', id: req.headers.authorization },
    'moderate',
    { type: 'Thread', id: req.params.id }
  );
  if (!authorized) {
    throw new Error(`Not allowed to lock thread ${req.params.id}`);
  }

  thread.locked = !!req.body.locked;
  await oso.bulk(
    [['is_locked', { type: 'Thread', id: thread.id }, null]],
    [['is_locked', { type: 'Thread', id: thread.id }, { type: 'Boolean', id: !!thread.locked + '' }]]
  );
  res.json({ thread });
});

app.put('/users/:id/ban', async function(req, res) {
  const user = users.find(user => user.id === req.params.id);
  if (!user) {
    throw new Error(`User ${req.params.id} not found`);
  }
  const authorized = await oso.authorize(
    { type: 'User', id: req.headers.authorization },
    'ban',
    { type: 'User', id: req.params.id }
  );
  if (!authorized) {
    throw new Error(`Not allowed to ban user ${req.params.id}`);
  }
  user.banned = !!req.body.banned;
  await oso.bulk(
    [['is_banned', { type: 'User', id: user.id }, null]],
    [['is_banned', { type: 'User', id: user.id }, { type: 'Boolean', id: user.banned + '' }]]
  );
  res.json({ user });
});

app.use(function(err, req, res, next) {
  res.status(500).json({ message: err.message });
});

app.listen(3000);
console.log('Listening on port 3000');