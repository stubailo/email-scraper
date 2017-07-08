var _this3 = this;

let configureInboxView = (() => {
  var _ref = _asyncToGenerator(function* (type = 'list') {
    var _this = this;

    const now = moment().format('x');

    if (!this.account.tokens.access_token || parseInt(moment(this.account.tokens.expiry_date).format('x')) < now) {
      console.log(chalk.bold('Please reauthorize this account (undersettings).'));
      return this.homeMenu(false);
    }

    const filter = this.searchFilter;
    const { accounts, account, accessToken, currentPage, next } = this;
    const count = currentPage % 5 * 20 > 0 ? currentPage % 5 * 20 : 100;
    welcome();
    this.status.start();
    yield this.saveMessagesInMemory(count);
    const messages = Object.keys(this.messages).map(function (key) {
      return _this.messages[key];
    }).filter(function (message) {
      return !message.trash;
    });
    printHeader(account, messages);

    const formattedMessages = parseMessages(messages);
    const emails = formattedMessages.map(function (message) {
      return { value: message.id, name: `${emoji.get('wave')} ${message.headers.subject} (${message.headers.from})` };
    });

    this.status.stop();
    const answers = yield this.inboxView(emails, type);
    yield inboxViewLogic(answers);
  });

  return function configureInboxView() {
    return _ref.apply(this, arguments);
  };
})();

let inboxViewLogic = (() => {
  var _ref2 = _asyncToGenerator(function* (answers) {
    var _this2 = this;

    var accessToken = this.account.tokens.access_token;
    switch (true) {
      case answers.menu === 'compose':
        inquirer.prompt(create).then(function (answers) {
          const { text, subject, recipient: to } = answers;
          const from = _this2.account.emailAddress;
          _this2.sendNew({ to, subject, from, text });
        }).then(function () {
          _this2.configureInboxView();
        });

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
          _this2.currentPage = 1;
          _this2.searchFilter = answers.search;
          _this2.next = null;
          _this2.configureInboxView();
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

  return function inboxViewLogic(_x) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');
const base64url = require('base64-url');
const emoji = require('node-emoji');
const moment = require('moment');
require('isomorphic-fetch');

const { getEmail } = require('../server/gmail/gmailClient');
const oauth2Client = require('../server/gmail/oauth2Client');

const { printHeader } = require('./utils/helpers');
const { parseMessages } = require('../server/gmail/helpers');

const { create } = require('./constants');
const Base = require('./base');
const welcome = require('./welcome');

module.exports = (() => {
  var _ref3 = _asyncToGenerator(function* (accounts) {
    const base = new Base();

    _.assign(_this3, base, { accounts }, { configureInboxView }, { oauth2Client: yield oauth2Client() });
    _this3.homeMenu();
  });

  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
})();