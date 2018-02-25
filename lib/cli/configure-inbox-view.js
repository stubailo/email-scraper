const emoji = require('node-emoji')
const { parseMessages } = require('../server/gmail/helpers')
const { printHeader } = require('./helpers')
const welcome = require('./welcome')
const chalk = require('chalk')
const db = require('./db')

async function configureInboxView (type = 'list') {
  const now = Date.now()
  if (
    !this.account.tokens.access_token ||
    this.account.tokens.expiry_date < now
  ) {
    console.log(chalk.bold('Please reauthorize this account (under settings).'))
    return this.homeMenu(false)
  }

  let {
    account,
    currentPage,
    next
  } = this

  let count = (currentPage % 10) * 10 > 0 ? (currentPage % 10) * 10 : 100
  next = count > 100 ? this.next : null

  welcome()
  this.status.start()

  await this.fetchMessages({count, next})

  const messages = db.get('messages').value()
    .filter(m => m.page && m.page === this.currentPage)
    .map(m => m.message)

  printHeader(account.profile, messages)

  const formattedMessages = parseMessages(messages)
  const emails = formattedMessages.map(message => ({
    value: message.id,
    name: `${emoji.get('wave')} ${message.headers.subject} (${message.headers.from})`
  }))

  this.status.stop()
  const answers = await this.inboxView(emails, type)
  await this.inboxViewPrompts(answers, messages)
}

module.exports = configureInboxView
