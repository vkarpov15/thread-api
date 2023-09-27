'use strict';

const { threads } = require('../state');

module.exports = function getThreads(req, res) {
  res.json({ threads });
};