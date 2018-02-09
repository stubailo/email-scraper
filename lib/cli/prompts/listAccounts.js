const inquirer = require('inquirer')

function listAccounts (accounts) {
  return inquirer.prompt([{
    name: 'accounts',
    type: 'list',
    message: 'Accounts',
    choices: Object.keys(accounts).map(key =>
      ({ name: key, value: key })
    )
  }])
}

module.exports = listAccounts
