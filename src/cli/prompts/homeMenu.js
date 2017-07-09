const inquirer = require('inquirer');
const welcome = require('../welcome');
const { home } = require('../constants');
var oauth2Client = require('../../server/gmail/oauth2Client')

async function homeMenu(clearfix = true) {
  this.listAccounts = listAccounts
  welcome(clearfix);
  var answers = await inquirer.prompt(home)
  var ans = answers.home
  switch (true) {
    case ans === 'Re-Authorize':
      require('../../server');
      break;
    case ans === 'Exit':
      process.exit();
    break;
    case ans === 'Settings':
      this.showAccounts();
      break;
    default:
      var resp = await listAccounts(this.accounts)
      const account = this.accounts[resp.accounts];
      
      var client = await oauth2Client()
      client.setCredentials(account.tokens)
      this.oauth2Client = client

      this.accessToken = account.tokens.access_token;
      this.account = account;
      this.configureInboxView();
  }
}

async function listAccounts(accounts) {
  var choices = Object.keys(accounts).map(key => ({ name: key, value: key }));
  return await inquirer.prompt([
  {
    name: 'accounts',
    type: 'list',
    message: 'Accounts',
    choices,
  }])
}

module.exports = homeMenu;
