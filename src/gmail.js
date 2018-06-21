const CLI = require('clui')
const Spinner = CLI.Spinner
const inquirer = require('inquirer')
const chalk = require('chalk')
const google = require('googleapis')
const gmail = google.gmail({ version: 'v1' })
const btoa = require('btoa')
const db = require('./db')
const { parseAndFormatMail, quickMailParse, printHeader } = require('./util')
const { REPLY, HOME, CREATE } = require('./constants')
const format = require('./format')
const welcome = require('./welcome')
const oauth2Client = require('./auth')
const {
  getEmail,
  getMessagesList,
  getEmails
} = require('./client')
const base64url = require('base64-url')
const emoji = require('./emoji')
inquirer.registerPrompt('lazy-list', require('inquirer-plugin-lazy-list'))

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
    const base64EncodedEmail = btoa(arr.join('\n'))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

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
    const answers = await inquirer.prompt([{
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
    }])
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
    const answers = await inquirer.prompt(REPLY)
    const handlers = {
      back: () => {
        this.configureInboxView()
      },
      reply: () => {
        this.replyToMessage(mail, threadId)
      },
      delete: () => {
        this.deleteMsg(messageId)
        this.configureInboxView()
      },
      home: () => {
        this.homeMenu()
      },
      exit: () => {
        process.exit = 0
      }
    }
    return handlers[answers.nav]()
  }

  async configureInboxView (type = 'lazy-list') {
    const now = Date.now()
    if (
      !this.state.account.tokens.access_token ||
      this.state.account.tokens.expiry_date < now
    ) {
      console.log(chalk.bold('Please reauthorize this account (under settings).'))
      return this.homeMenu(false)
    }
    let cachedMessagesCount = db.get('messages').value().length
    welcome(false, cachedMessagesCount)
    this.status.start()
    await this.fetchMessages()

    const messages = db.get('messages').value()
    printHeader(this.state.account.profile, messages)

    const emails = format(messages).map(message => ({
      value: message.id,
      name: `${message.headers.subject} (${message.headers.from})`
    }))

    this.status.stop()
    const answers = await this.inboxView(emails, type)
    await this.inboxViewPrompts(answers, messages)
  }

  async homeMenu (clearfix = true) {
    let cachedMessagesCount = db.get('messages').value().length
    welcome(clearfix, cachedMessagesCount)
    let { home } = await inquirer.prompt(HOME)

    switch (home) {
      case 'Re-Authorize':
        require('./server')
        break
      case 'Exit':
        process.exit = 0
        break
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

  async openEmail (answers, _) {
    let message = db.get('messages').find(message => message.id === id)
    let accessToken = this.state.account.tokens.access_token
    let id = answers.menu
    let raw = await getEmail({ accessToken, id, format: 'raw' })
    let source = base64url.decode(raw.raw)
    this.nav({
      source,
      messageId: id,
      threadId: message.threadId || undefined
    })
  }

  async inboxViewPrompts (answers, messages) {
    const handler = {
      compose: () => {
        inquirer.prompt(CREATE).then((answers) => {
          const { text, subject, recipient } = answers
          const sender = this.state.account.emailAddress
          this.sendNew({ subject, recipient, sender, text })
        }).then(() => { this.configureInboxView() })
      },
      checkbox: () => {
        this.configureInboxView('checkbox')
      },
      exit: () => {
        process.exit = 0
      },
      search: () => {
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
      }
    }
    if (handler[answers.menu]) {
      return handler[answers.menu]()
    }
    return this.openEmail(answers, messages)
  }

  async inboxView (choices, type = 'lazy-list') {
    let options = [
      new inquirer.Separator(),
      { name: 'Home', value: 'home' },
      { name: 'Exit', value: 'exit' },
      { name: 'Search', value: 'search' },
      { name: 'Bulk', value: 'bulk' },
      { name: `Compose ${emoji.message}`, value: 'compose' }
    ]

    choices.unshift(new inquirer.Separator())
    choices = choices.concat(options)
    const fetchMore = async () => {
      this.state.page++
      await this.fetchMessages()
      const messages = db.get('messages').value()
      const formattedMessages = format(messages)
      const emails = formattedMessages.map(message => ({
        value: message.id,
        name: `${message.headers.subject} (${message.headers.from})`
      }))
      return emails
    }

    let pageSize = 10
    let inq = inquirer.prompt([{
      name: 'menu',
      type,
      message: 'Inbox',
      pageSize: pageSize,
      choices,
      onChange: (state, eventType) => {
        let index = state.selected
        let listLength = state.opt.choices.realLength
        let shouldFetchMore = (index + pageSize) > listLength
        if (
          eventType === 'onDownKey' &&
          shouldFetchMore
        ) {
          return fetchMore(state.opt.choices.length)
        }
      }
    }])
    return inq
  }

  async fetchMessages () {
    const store = db.get('messages')
    const { token, filter } = this.state
    const next = db.get(`pages.${this.state.page}`, undefined).value()
    const resp = await getMessagesList({
      accessToken: token,
      next,
      filter
    })
    db.set(`pages.${this.state.page + 1}`, resp.nextPageToken).write()
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
