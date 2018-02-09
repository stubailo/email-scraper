const CLI = require('clui')

const Spinner = CLI.Spinner
const inquirer = require('inquirer')

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
}

Gmail.prototype.inboxViewLogic = require('./inboxViewLogic')
Gmail.prototype.configureInboxView = require('./configureInboxView')
Gmail.prototype.fetchMessagesAndSetState = require('./fetchMessagesAndSetState')
Gmail.prototype.replyToMessage = require('./prompts/replyToMessage')
Gmail.prototype.showAccounts = require('./showAccounts')
Gmail.prototype.sendNew = require('./sendNew')
Gmail.prototype.deleteMsg = require('./deleteMsg')
Gmail.prototype.homeMenu = require('./prompts/homeMenu')
Gmail.prototype.inboxView = require('./prompts/inboxView')
Gmail.prototype.send = require('./send')
Gmail.prototype.nav = require('./prompts/nav')
Gmail.prototype.listAccounts = require('./prompts/listAccounts')

module.exports = Gmail
