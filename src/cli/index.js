
const _ = require('lodash');
const Base = require('./base');

async function Gmail (accounts) {
  Base.apply(this, arguments)
  console.log(this.accounts)
  await this.homeMenu()
}

module.exports = Gmail