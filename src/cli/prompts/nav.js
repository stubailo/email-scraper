const inquirer = require('inquirer');
const { reply } = require('../constants');
const { parseAndFormatMail, quickMailParse } = require('../utils/helpers');

module.exports = async function ({ source, threadId, messageId }) {
  const arr = await parseAndFormatMail(source);
  const mail = await quickMailParse(source);

  this.ui.log.write(arr.join('\n'));
  var answers = await inquirer.prompt(reply)
  
  switch (true) {
    case answers.nav === 'back':
      await this.configureInboxView();
      break;
    case answers.nav === 'reply':
      this.replyToMessage(mail);
      break;
    case answers.nav === 'delete':
      this.deleteMsg(messageId);
      await this.configureInboxView();
      break;
    case answers.nav === 'home':
      this.homeMenu();
      break;
    case answers.nav === 'exit':
      process.exit();
  }
};
