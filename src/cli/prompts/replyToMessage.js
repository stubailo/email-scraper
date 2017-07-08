const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = function (mail) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'subject',
      message: 'Subject',
      default: mail.subject,
    }, {
      type: 'input',
      name: 'to',
      message: 'To',
      default: mail.from.value[0].address,
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
    this.send({ text, subject, to, threadId, from: mail.to.value[0].address });
    console.log(chalk.green('Success!'));
    this.configureInboxView();
  });
};
