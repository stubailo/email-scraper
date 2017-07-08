const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');

module.exports = (clearfix = true) => {
  if (clearfix) {
    clear();
  }
  console.log(chalk.cyan(figlet.textSync('gmail-cli', { horizontalLayout: 'full' })));
};