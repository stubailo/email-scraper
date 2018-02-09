const inquirer = require('inquirer')
const welcome = require('../welcome')
const { home } = require('../constants')
var oauth2Client = require('../../server/gmail/oauth2Client')

async function homeMenu (clearfix = true) {
  welcome(clearfix)
  let answers = await inquirer.prompt(home)
  let ans = answers.home

  switch (true) {
    case ans === 'Re-Authorize':
      require('../../server')
      break
    case ans === 'Exit':
      process.exit()
      break
    case ans === 'Settings':
      this.showAccounts()
      break
    default:
      let resp = await this.listAccounts(this.accounts)
      let account = this.accounts[resp.accounts]
      let client = await oauth2Client()
      client.setCredentials(account.tokens)
      this.oauth2Client = client

      this.accessToken = account.tokens.access_token
      this.account = account
      this.configureInboxView()
  }
}

module.exports = homeMenu
