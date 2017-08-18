let inboxViewLogic = (() => {
  var _ref = _asyncToGenerator(function* (answers, messages) {
    var _this = this;

    var accessToken = this.account.tokens.access_token;
    switch (true) {
      case answers.menu === 'compose':
        inquirer.prompt(create).then(function (answers) {
          const { text, subject, recipient: to } = answers;
          const from = _this.account.emailAddress;
          _this.sendNew({ to, subject, from, text });
        }).then(function () {
          _this.configureInboxView();
        });
        break;
      case answers.menu === 'bulk':
        this.configureInboxView('checkbox');
        break;
      case typeof answers.menu === 'number':
        this.currentPage = answers.menu;

        if (this.currentPage % 5 === 1 && this.currentPage > 1) {
          this.next = resp.next;
        }
        this.configureInboxView();
        break;
      case answers.menu === 'home':
        this.homeMenu();
        break;
      case answers.menu === 'exit':
        process.exit();
        break;
      case answers.menu === 'search':
        inquirer.prompt([{
          type: 'input',
          name: 'search',
          message: 'Search'
        }]).then(function (answers) {
          _this.currentPage = 1;
          _this.searchFilter = answers.search;
          _this.next = null;
          _this.configureInboxView();
        });
        break;
      case /[0-9\w]+/.test(answers.menu):
        var id = answers.menu;

        var raw = yield getEmail({ accessToken, id, format: 'raw' });
        var source = base64url.decode(raw.raw);
        this.nav({
          source,
          messageId: id,
          threadId: messages.find(function (msg) {
            return msg.id === id;
          }).threadId
        });
        break;
      default:
        console.log(chalk.red('Error!'));
    }
  });

  return function inboxViewLogic(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var inquirer = require('inquirer');
const { getEmail } = require('../server/gmail/gmailClient');
const { create } = require('./constants');
const base64url = require('base64-url');
const chalk = require('chalk');

module.exports = inboxViewLogic;