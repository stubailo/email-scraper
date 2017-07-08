const chalk = require('chalk');

module.exports = function () {
  console.log(chalk.yellow(JSON.stringify(this.accounts, null, 2)));
  this.homeMenu(false);
};