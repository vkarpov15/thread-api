'use strict';

const oso = require('../oso');
const { users } = require('../state');

module.exports = async function postUsers(req, res) {
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
}