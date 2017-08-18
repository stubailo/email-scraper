let homeMenu = (() => {
  var _ref = _asyncToGenerator(function* (clearfix = true) {
    this.listAccounts = listAccounts;
    welcome(clearfix);
    var answers = yield inquirer.prompt(home);
    var ans = answers.home;
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
        var resp = yield listAccounts(this.accounts);
        const account = this.accounts[resp.accounts];

        var client = yield oauth2Client();
        client.setCredentials(account.tokens);
        this.oauth2Client = client;

        this.accessToken = account.tokens.access_token;
        this.account = account;
        this.configureInboxView();
    }
  });

  return function homeMenu() {
    return _ref.apply(this, arguments);
  };
})();

let listAccounts = (() => {
  var _ref2 = _asyncToGenerator(function* (accounts) {
    var choices = Object.keys(accounts).map(function (key) {
      return { name: key, value: key };
    });
    return yield inquirer.prompt([{
      name: 'accounts',
      type: 'list',
      message: 'Accounts',
      choices
    }]);
  });

  return function listAccounts(_x) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const welcome = require('../welcome');
const { home } = require('../constants');
var oauth2Client = require('../../server/gmail/oauth2Client');

module.exports = homeMenu;