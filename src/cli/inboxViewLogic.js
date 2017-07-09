var inquirer = require('inquirer')
const { getEmail } = require('../server/gmail/gmailClient');
const { create } = require('./constants');
const base64url = require('base64-url');
const chalk = require('chalk');

async function inboxViewLogic (answers, messages) {
  var accessToken = this.account.tokens.access_token
  switch (true) {
    case answers.menu === 'compose':
      inquirer.prompt(create).then((answers) => {
        const { text, subject, recipient: to } = answers;
        const from = this.account.emailAddress;
        this.sendNew({ to, subject, from, text });
      }).then(() => { this.configureInboxView(); });
      break
    case answers.menu === 'bulk':
      this.configureInboxView('checkbox');
      break;
    case typeof answers.menu === 'number':
      this.currentPage = answers.menu;

      if (this.currentPage % 5 === 1 && this.currentPage > 1) {
        this.next = resp.next;
      }
      this.configureInboxView();
      break;
    case answers.menu === 'home':
      this.homeMenu();
      break;
    case answers.menu === 'exit':
      process.exit();
      break;
    case answers.menu === 'search':
      inquirer.prompt([{
        type: 'input',
        name: 'search',
        message: 'Search',
      }]).then((answers) => {
        this.currentPage = 1;
        this.searchFilter = answers.search;
        this.next = null;
        this.configureInboxView();
      });
      break;
    case /[0-9\w]+/.test(answers.menu):
      var id = answers.menu;
      
      var raw = await getEmail({ accessToken, id, format: 'raw' });
      var source = base64url.decode(raw.raw);
      this.nav({
        source,
        messageId: id,
        threadId: messages.find(msg => msg.id === id).threadId,
      });
      break;
    default:
      console.log(chalk.red('Error!'));
  }
}

module.exports = inboxViewLogic