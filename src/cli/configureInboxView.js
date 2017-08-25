const moment = require('moment');
const emoji = require('node-emoji');
const { parseMessages } = require('../server/gmail/helpers')
const { printHeader } = require('./utils/helpers');
const welcome = require('./welcome');
const chalk = require('chalk');

async function configureInboxView(type = 'list') {
  const now = moment().format('x');

  if (!this.account.tokens.access_token ||
    parseInt(moment(this.account.tokens.expiry_date).format('x')) < now) {
    console.log(chalk.bold('Please reauthorize this account (undersettings).'))
    return this.homeMenu(false)
  }

  const filter = this.searchFilter;
  const { accounts, account, accessToken, currentPage, next } = this;
  const count = (currentPage % 10) * 10 > 0 ? (currentPage % 10) * 10 : 100;
  console.log(count)
  next = count > 100 ? this.next : null
  welcome();
  this.status.start();
  await this.saveMessagesInMemory({count, next});
  const messages = Object.keys(this.messages)
    .map(key => this.messages[key])
    .filter(message => !message.trash && message.show)
    .map(msg => msg.message)

  printHeader(account, messages);

  const formattedMessages = parseMessages(messages);
  const emails = formattedMessages.map(message => ({
    value: message.id,
    name: `${emoji.get('wave')} ${message.headers.subject} (${message.headers.from})`
  }));

  this.status.stop();
  const answers = await this.inboxView(emails, type);
  await this.inboxViewLogic(answers, messages)
}

module.exports = configureInboxView
