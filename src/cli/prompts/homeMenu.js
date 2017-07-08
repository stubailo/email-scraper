const inquirer = require('inquirer');
const welcome = require('../welcome');
const { home } = require('../constants');

function homeMenu(clearfix = true) {
  welcome(clearfix);
  inquirer.prompt(home).then((answers) => {
    const ans = answers.home;
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
        var choices = Object.keys(this.accounts).map(key => ({ name: key, value: key }));
        inquirer.prompt([
          {
            name: 'accounts',
            type: 'list',
            message: 'Accounts',
            choices,
          },
        ]).then(ans => {
          const account = this.accounts[ans.accounts];
          this.accessToken = account.tokens.access_token;
          this.oauth2Client.setCredentials(account.tokens);
          this.account = account;
          this.configureInboxView();
        });
    }
  });
}

module.exports = homeMenu;
