const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = function (mail) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'subject',
      message: 'Subject',
      default: mail && mail.subject ? mail.subject : '',
    }, {
      type: 'input',
      name: 'to',
      message: 'To',
      default: mail && mail.from && mail.from.value[0].address ? mail.from.value[0].address : '',
    }, {
      type: 'input',
      name: 'draft',
      message: 'Compose message',
    }, {
      type: 'confirm',
      name: 'confirmation',
      message: 'Send?',
    },
  ]).then((answers) => {
    const text = answers.draft;
    const { to, subject } = answers;
    this.send({ text, subject, to, threadId, from: this.account.emailAdress });
    console.log(chalk.green('Success!'));
    this.configureInboxView();
  });
};
