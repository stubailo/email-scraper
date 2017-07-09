const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
const base64url = require('base64-url');
const emoji = require('node-emoji');
const moment = require('moment');
require('isomorphic-fetch');

const { getEmail } = require('../server/gmail/gmailClient');
const oauth2Client = require('../server/gmail/oauth2Client');

const { printHeader } = require('./utils/helpers');
const { parseMessages } = require('../server/gmail/helpers')

const { create } = require('./constants');
const Base = require('./base');
const welcome = require('./welcome');

async function configureInboxView(type = 'list') {
  const now = moment().format('x');

  if (!this.account.tokens.access_token || parseInt(moment(this.account.tokens.expiry_date).format('x')) < now) {
    console.log(chalk.bold('Please reauthorize this account (undersettings).'));
    return this.homeMenu(false);
  }

  const filter = this.searchFilter;
  const { accounts, account, accessToken, currentPage, next } = this;
  const count = (currentPage % 5) * 20 > 0 ? (currentPage % 5) * 20 : 100;
  welcome();
  this.status.start();
  await this.saveMessagesInMemory(count);
  const messages = Object.keys(this.messages).map(key => 
    this.messages[key]
  ).filter(message => !message.trash);
  printHeader(account, messages);

  const formattedMessages = parseMessages(messages);
  const emails = formattedMessages.map(message => ({ value: message.id, name: `${emoji.get('wave')} ${message.headers.subject} (${message.headers.from})` }));

  this.status.stop();
  const answers = await this.inboxView(emails, type);
  await this.inboxViewLogic(answers)
}

async function inboxViewLogic (answers) {
  var accessToken = this.account.tokens.access_token
  var messages = this.messages
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

module.exports = async (accounts) => {
  const base = new Base();

  _.assign(
    this,
    base,
    { accounts },
    { configureInboxView },
    { inboxViewLogic },
    { oauth2Client: await oauth2Client() },
  );
  this.homeMenu();
};
