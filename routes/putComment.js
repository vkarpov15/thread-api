'use strict';

const oso = require('../oso');
const { threads } = require('../state');

module.exports = async function putComments(req, res) {
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
}