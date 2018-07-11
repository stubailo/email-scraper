const CLI = require('clui')
const Spinner = CLI.Spinner
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./db')
const { parseAndFormatMail } = require('./util')
const { REPLY, HOME, CREATE } = require('./constants')
const format = require('./format')
const Client = require('./client')
const { Subject } = require('rxjs')
const simpleParser = require('mailparser').simpleParser

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
    this.prompts = new Subject()
    this.inquirer = inquirer.prompt(this.prompts)
    this.subscribe()
  }

  setState (state) {
    this.state = {
      ...this.state,
      ...state
    }
  }

  renderSettings () {
    console.log(
      chalk.yellow(
        JSON.stringify(this.accounts, null, 2)
      )
    )
    this.renderMain()
  }

  async renderReply (mail, threadId) {
    this.prompts.next({
      type: 'input',
      name: 'subject',
      message: 'Subject',
      default: mail && mail.subject
        ? mail.subject
        : ''
    }, {
      type: 'input',
      name: 'recipient',
      message: 'To',
      default: mail && mail.from && mail.from.value[0].address
        ? mail.from.value[0].address
        : ''
    }, {
      type: 'input',
      name: 'draft',
      message: 'Compose message'
    }, {
      type: 'confirm',
      name: 'confirmation',
      message: 'Send?'
    })
    this.createConfirmationHandler(threadId)
  }

  renderAccounts (accounts) {
    this.prompts.next({
      name: 'handleAccounts',
      type: 'list',
      message: 'Accounts',
      choices: Object.keys(accounts).map(key =>
        ({ name: key, value: key })
      )
    })
  }

  async configure (type = 'lazy-list') {
    const now = Date.now()
    if (
      !this.client.account.tokens.access_token ||
      this.client.account.tokens.expiry_date < now
    ) {
      require('./server')
    }
    await this.client.fetchMessages()
    const messages = db.get('messages').value()
    const emails = format(messages).map(message => ({
      value: message.id,
      name: `${message.headers.subject} (${message.headers.from})`
    }))
    this.renderInbox(emails, type)
  }

  async renderMain () {
    this.prompts.next(HOME)
  }

  async renderMessage (id) {
    let {
      source,
      message,
      raw
    } = await this.client.getMessage(id)
    const lines = await parseAndFormatMail(source)
    const mail = await simpleParser(source)
    this.ui.log.write(lines.join('\n'))
    this.prompts.next(REPLY)

    Gmail.prototype.handleMessage = function ({ answer }) {
      let { threadId } = message
      let messageId = id
      const handlers = {
        back: () => {
          this.configure()
        },
        reply: () => {
          this.renderReply(mail, threadId)
        },
        delete: () => {
          this.client.deleteMessage(messageId)
          this.configure()
        },
        home: () => {
          this.renderMain()
        },
        exit: () => {
          process.exit = 0
        }
      }
      return handlers[answer]()
    }
  }

  async inboxViewPrompts (answers, messages) {
    const handler = {
      compose: () => {
        this.prompts.next(...CREATE).then((answers) => {
          const { text, subject, recipient } = answers
          const sender = this.state.account.emailAddress
          this.client.send({ subject, recipient, sender, text })
        }).then(() => this.configure())
      },
      checkbox: () => {
        this.configure('checkbox')
      },
      exit: () => {
        process.exit = 0
      },
      search: () => {
        this.prompts.next({
          type: 'input',
          name: 'search',
          message: 'Search'
        })
      }
    }
    if (handler[answers.menu]) {
      return handler[answers.menu]()
    }
    return this.renderMessage(answers, messages)
  }

  async renderInbox (choices, type = 'lazy-list') {
    const fetchMore = async () => {
      this.state.page++
      await this.client.fetchMessages(this.state.page)
      const messages = db.get('messages').value()
      const formattedMessages = format(messages)
      const emails = formattedMessages.map(message => ({
        value: message.id,
        name: `${message.headers.subject} (${message.headers.from})`
      }))
      return emails
    }

    let pageSize = 10
    this.prompts.next({
      name: 'handleInbox',
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
    })
  }

  createConfirmationHandler (threadId) {
    Gmail.prototype.handleConfirmation = function (answers) {
      if (answers.confirmation) {
        const text = answers.draft
        const { recipient, subject } = answers
        this.client.reply({
          text,
          subject,
          recipient,
          threadId,
          sender: this.state.account.emailAddress
        })
        console.log(chalk.green('Success!'))
        this.configure()
      }
    }
  }

  handleMain ({ answer }) {
    const handlers = {
      authorize: () => {
        require('./server')
      },
      exit: () => {
        process.exit = 0
      },
      settings: () => {
        this.renderSettings()
      },
      inbox: () => {
        this.renderAccounts(this.accounts)
      },
      compose: () => {
        this.prompts.next(...CREATE)
      }
    }
    return handlers[answer]()
  }

  async handleSend (answers) {
    const { text, subject, recipient } = answers
    const sender = this.state.account.emailAddress
    this.client.send({ subject, recipient, sender, text })
      .then(() => this.configure())
  }

  async handleAccounts ({ answer }) {
    let account = this.accounts[answer]
    this.client = await Client.create(account)
    this.configure()
  }

  handleInbox ({ answer }) {
    this.renderMessage(answer)
  }

  subscribe () {
    this.inquirer.ui.process.subscribe(
      (answer) => {
        console.log(answer)
        if (this[answer.name]) {
          return this[answer.name](answer)
        }
      },
      () => {},
      () => {}
    )
  }
}

module.exports = Gmail
