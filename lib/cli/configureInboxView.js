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
      return !message.trash && message.show;
    });

    printHeader(account, messages);

    const formattedMessages = parseMessages(messages);
    const emails = formattedMessages.map(function (message) {
      return {
        value: message.id,
        name: `${emoji.get('wave')} ${message.headers.subject} (${message.headers.from})`
      };
    });

    this.status.stop();
    const answers = yield this.inboxView(emails, type);
    yield this.inboxViewLogic(answers, messages);
  });

  return function configureInboxView() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const moment = require('moment');
const emoji = require('node-emoji');
const { parseMessages } = require('../server/gmail/helpers');
const { printHeader } = require('./utils/helpers');
const welcome = require('./welcome');
const chalk = require('chalk');

module.exports = configureInboxView;