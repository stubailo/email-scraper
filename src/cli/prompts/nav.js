const inquirer = require('inquirer');
const { reply } = require('../constants');
const { parseAndFormatMail, quickMailParse } = require('../utils/helpers');

module.exports = async function nav({ source, threadId, messageId }) {
  const arr = await parseAndFormatMail(source);
  const mail = await quickMailParse(source);

  this.ui.log.write(arr.join('\n'));
  inquirer.prompt(reply)
    .then(async (answers) => {
      switch (true) {
        case answers.nav === 'back':
          await this.configureInboxView();
          break;
        case answers.nav === 'reply':
          this.replyToMessage();
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
    });
};
