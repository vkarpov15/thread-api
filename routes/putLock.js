'use strict';

const oso = require('../oso');
const { threads } = require('../state');

module.exports = async function putLock(req, res) {
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
}