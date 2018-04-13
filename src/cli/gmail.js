const CLI = require('clui')
const Spinner = CLI.Spinner
const inquirer = require('inquirer')
const chalk = require('chalk')
const google = require('googleapis')
const gmail = google.gmail({ version: 'v1' })
const btoa = require('btoa')
const db = require('./db')
const { parseAndFormatMail, quickMailParse, printHeader } = require('./helpers')
const { REPLY, HOME, CREATE } = require('./constants')
const emoji = require('node-emoji')
const { parseMessages } = require('../server/gmail/helpers')
const welcome = require('./welcome')
const oauth2Client = require('../server/gmail/auth')
const {
  getEmail,
  getMessagesList,
  getEmails
} = require('../server/gmail/gmailClient')
const base64url = require('base64-url')

class Gmail {
  constructor (accounts) {
    this.accounts = accounts
    this.status = new Spinner('Loading...')
    this.ui = new inquirer.ui.BottomBar()
    this.state = {
      client: undefined,
      account: {},
      page: 1,
      next: undefined,
      filter: undefined,
      token: undefined
    }
  }

  setState (state) {
    let shouldUpdate = Math.floor(Date.now() / 1000) % 10 === 0
    if (shouldUpdate) {
      console.log(chalk.gray('clearing cache...'))
      db.set('messages', []).write()
    }
    this.state = {
      ...this.state,
      ...state
    }
  }

  showAccounts () {
    console.log(
      chalk.yellow(
        JSON.stringify(this.accounts, null, 2)
      )
    )
    this.homeMenu(false)
  }

  deleteMsg (messageId) {
    gmail.users.messages.trash({
      auth: this.state.client,
      userId: 'me',
      id: messageId
    })
    db.get('messages').remove({id: messageId}).write()
  }

  sendNew ({ text, sender, recipient, subject }) {
    this.setState({ stale: true })
    const base64Encoded = btoa([
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${sender}`,
      `To: ${recipient}\n`,
      `${text}`
    ].join('\n')).replace(/\+/g, '-').replace(/\//g, '_')
    gmail.users.messages.send({
      auth: this.state.client,
      userId: 'me',
      resource: { raw: base64Encoded }
    })
  }

  send ({ text, sender, recipient, subject, threadId }) {
    this.setState({ stale: true })
    const arr = [
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${sender}`,
      `To: ${recipient}\n`,
      `${text}`
    ]
    console.log(chalk.cyan(arr.join('\n')))
    const base64EncodedEmail = btoa(arr.join('\n')).replace(/\+/g, '-').replace(/\//g, '_')

    gmail.users.messages.send({
      auth: this.state.client,
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
        threadId
      }
    })
  }

  async replyToMessage (mail, threadId) {
    this.setState({ stale: true })
    var answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'subject',
        message: 'Subject',
        default: mail && mail.subject ? mail.subject : ''
      }, {
        type: 'input',
        name: 'recipient',
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
      const { recipient, subject } = answers
      this.send({
        text,
        subject,
        recipient,
        threadId,
        sender: this.state.account.emailAddress
      })
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
    var answers = await inquirer.prompt(REPLY)

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

  async configureInboxView (type = 'list') {
    const now = Date.now()
    if (
      !this.state.account.tokens.access_token ||
      this.state.account.tokens.expiry_date < now
    ) {
      console.log(chalk.bold('Please reauthorize this account (under settings).'))
      return this.homeMenu(false)
    }

    let {
      account,
      page
    } = this.state

    welcome()
    this.status.start()
    let cachedMessagesCount = db.get('messages').value().length
    if (
      cachedMessagesCount < (page * 10) ||
      this.state.stale
    ) {
      await this.fetchMessages()
      this.setState({ stale: false })
    }
    const messages = db.get('messages').value()
      .slice((page * 10) - 10, page * 10)
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

  async homeMenu (clearfix = true) {
    welcome(clearfix)
    let { home } = await inquirer.prompt(HOME)

    switch (home) {
      case 'Re-Authorize':
        require('../server')
        break
      case 'Exit':
        process.exit()
      case 'Settings':
        this.showAccounts()
        break
      default:
        let resp = await this.listAccounts(this.accounts)
        let account = this.accounts[resp.accounts]
        let client = await oauth2Client()
        client.setCredentials(account.tokens)
        this.setState({
          account,
          client,
          token: account.tokens.access_token
        })
        this.configureInboxView()
    }
  }

  async inboxViewPrompts (answers, messages) {
    let accessToken = this.state.account.tokens.access_token

    switch (true) {
      case answers.menu === 'compose':
        inquirer.prompt(CREATE).then((answers) => {
          const { text, subject, recipient } = answers
          const sender = this.state.account.emailAddress
          this.sendNew({ subject, recipient, sender, text })
        }).then(() => { this.configureInboxView() })
        break
      case answers.menu === 'bulk':
        this.configureInboxView('checkbox')
        break
      case typeof answers.menu === 'number':
        if (answers.menu % 10 === 0) {
          db.set('messages', []).write()
        }
        this.setState({ page: answers.menu })
        this.configureInboxView()
        break
      case answers.menu === 'home':
        this.homeMenu()
        break
      case answers.menu === 'exit':
        process.exit()
      case answers.menu === 'search':
        inquirer.prompt([{
          type: 'input',
          name: 'search',
          message: 'Search'
        }]).then((answers) => {
          this.setState({
            page: 1,
            filter: answers.search,
            next: undefined
          })
          this.configureInboxView()
        })
        break
      case /[0-9\w]+/.test(answers.menu):
        let id = answers.menu
        let raw = await getEmail({ accessToken, id, format: 'raw' })
        let source = base64url.decode(raw.raw)
        this.nav({
          source,
          messageId: id,
          threadId: messages.find(msg => msg.id === id).threadId
        })

        break
      default:
        console.log(chalk.red('Error!'))
    }
  }

  async inboxView (choices, type = 'list') {
    let options = [
      new inquirer.Separator(),
      { name: 'Home', value: 'home' },
      { name: 'Exit', value: 'exit' },
      { name: 'Search', value: 'search' },
      { name: 'Bulk', value: 'bulk' },
      { name: `Compose ${emoji.get('email')}`, value: 'compose' }
    ]

    const { page } = this.state
    const nextPage = `Page ${page + 1} (next) ${emoji.get('arrow_forward')}`
    choices.unshift(new inquirer.Separator())
    choices = choices.concat(options)

    if (page > 1) {
      const prevPage = `Page ${page - 1} (previous) ${emoji.get('arrow_backward')}`
      choices.unshift({ name: prevPage, value: page - 1 })
    }

    choices.unshift({ name: nextPage, value: page + 1 })

    return inquirer.prompt([{
      name: 'menu',
      type,
      message: 'Inbox',
      pageSize: 10,
      choices
    }])
  }

  async fetchMessages () {
    const store = db.get('messages')
    const { token, filter, next } = this.state
    const resp = await getMessagesList({ accessToken: token, next, filter })

    this.setState({ next: resp.nextPageToken })
    let _messages = resp.messages.filter(message =>
      !store.find({id: message.id}).value()
    )

    if (_messages && _messages.length) {
      const messages = await getEmails({
        accessToken: token,
        messages: _messages,
        format: 'full'
      })
      db.set(
        'messages',
        messages.concat(store.value()).sort((a, b) =>
          parseInt(b.internalDate) - parseInt(a.internalDate)
        )
      ).write()
    }
  }
}

module.exports = Gmail
