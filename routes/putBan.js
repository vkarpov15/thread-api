'use strict';

const oso = require('../oso');
const { users } = require('../state');

module.exports = async function putBan(req, res) {
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
  // If banning an admin, make sure to remove the "admin" role first
  if (user.roles.includes('admin')) {
    await oso.delete('has_role', { type: 'User', id: user.id }, 'admin');
    user.roles = user.roles.filter(role => role !== 'admin');
  }
  user.banned = !!req.body.banned;
  await oso.bulk(
    [['is_banned', { type: 'User', id: user.id }, null]],
    [['is_banned', { type: 'User', id: user.id }, { type: 'Boolean', id: user.banned + '' }]]
  );
  res.json({ user });
};