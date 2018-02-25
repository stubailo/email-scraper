const CLI = require('clui')
const Spinner = CLI.Spinner
const inquirer = require('inquirer')
const chalk = require('chalk')
const google = require('googleapis')
const gmail = google.gmail({ version: 'v1' })
const btoa = require('btoa')
const db = require('./db')
const { parseAndFormatMail, quickMailParse } = require('./helpers')
const { reply } = require('./constants')

class Gmail {
  constructor (accounts) {
    this.accounts = accounts
    this.accessToken = null
    this.currentPage = 1
    this.searchFilter = null
    this.next = null
    this.account = null
    this.status = new Spinner('Loading...')
    this.ui = new inquirer.ui.BottomBar()
  }

  showAccounts () {
    console.log(chalk.yellow(JSON.stringify(this.accounts, null, 2)))
    this.homeMenu(false)
  }

  deleteMsg (messageId) {
    gmail.users.messages.trash({
      auth: this.oauth2Client,
      userId: 'me',
      id: messageId
    })
    db.get('messages').remove({id: messageId}).write()
  }

  sendNew ({ text, from, to, subject }) {
    const base64Encoded = btoa([
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${to}`,
      `To: ${from}\n`,
      `${text}`
    ].join('\n')).replace(/\+/g, '-').replace(/\//g, '_')
    gmail.users.messages.send({
      auth: this.oauth2Client,
      userId: 'me',
      resource: { raw: base64Encoded }
    })
  }

  send ({ text, from, to, subject, threadId }) {
    const arr = [
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${from}`,
      `To: ${to}\n`,
      `${text}`
    ]
    console.log(chalk.cyan(arr.join('\n')))
    const base64EncodedEmail = btoa(arr.join('\n')).replace(/\+/g, '-').replace(/\//g, '_')

    gmail.users.messages.send({
      auth: this.oauth2Client,
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
        threadId
      }
    })
  }

  async replyToMessage (mail, threadId) {
    var answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'subject',
        message: 'Subject',
        default: mail && mail.subject ? mail.subject : ''
      }, {
        type: 'input',
        name: 'to',
        message: 'To',
        default: mail && mail.from && mail.from.value[0].address ? mail.from.value[0].address : ''
      }, {
        type: 'input',
        name: 'draft',
        message: 'Compose message'
      }, {
        type: 'confirm',
        name: 'confirmation',
        message: 'Send?'
      }
    ])
    if (answers.confirmation) {
      const text = answers.draft
      const { to, subject } = answers
      this.send({ text, subject, to, threadId, from: this.account.emailAddress })
      console.log(chalk.green('Success!'))
    }
    this.configureInboxView()
  }

  listAccounts (accounts) {
    return inquirer.prompt([{
      name: 'accounts',
      type: 'list',
      message: 'Accounts',
      choices: Object.keys(accounts).map(key =>
        ({ name: key, value: key })
      )
    }])
  }

  async nav ({ source, threadId, messageId }) {
    const lines = await parseAndFormatMail(source)
    const mail = await quickMailParse(source)

    this.ui.log.write(
      lines.join('\n')
    )
    var answers = await inquirer.prompt(reply)

    switch (answers.nav) {
      case 'back':
        await this.configureInboxView()
        break
      case 'reply':
        this.replyToMessage(mail, threadId)
        break
      case 'delete':
        this.deleteMsg(messageId)
        await this.configureInboxView()
        break
      case 'home':
        this.homeMenu()
        break
      case 'exit':
        process.exit()
    }
  }
}

Gmail.prototype.inboxViewPrompts = require('./inbox-view-prompts')
Gmail.prototype.configureInboxView = require('./configure-inbox-view')
Gmail.prototype.fetchMessages = require('./fetch-messages')
Gmail.prototype.homeMenu = require('./home-menu')
Gmail.prototype.inboxView = require('./inbox-view')

module.exports = Gmail
