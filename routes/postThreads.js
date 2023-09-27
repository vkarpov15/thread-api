'use strict';

const oso = require('../oso');
const { threads } = require('../state');

module.exports = async function postThreads(req, res) {
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
};