
const _ = require('lodash');
const Base = require('./base');

async function Gmail (accounts) {
  Base.apply(this, arguments)
  await this.homeMenu()
}

module.exports = Gmail