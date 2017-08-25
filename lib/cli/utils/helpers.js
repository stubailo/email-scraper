let saveMessagesInMemory = (() => {
  var _ref2 = _asyncToGenerator(function* ({ count, next }) {
    var _this = this;

    const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in ms

    const { accessToken, searchFilter } = this;

    const resp = yield getMessagesList({ accessToken, next, filter: searchFilter });
    const start = count - 10 >= 0 ? count - 10 : 0;

    this.next = resp.next;

    //for(key in this.messages) {
    //  this.messages[key] = Object.assign({}, this.messages[key], { show: false })
    //}

    const input = resp.messages.slice(start, count).filter(function (message) {
      return !_this.messages[message.id] || _this.messages[message.id].timestamp + CACHE_TIME <= parseInt(moment().format('x'));
    });

    if (input && input.length > 0) {
      const messages = yield getEmails({
        accessToken,
        count,
        messages: input,
        format: 'full'
      });
      messages.forEach(function (message) {
        _this.messages[message.id] = {
          message,
          show: true,
          timestamp: moment().format('x')
        };
      });
    }
  });

  return function saveMessagesInMemory(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('isomorphic-fetch');
const { getEmails, getMessagesList } = require('../../server/gmail/gmailClient');
const { parseMessages } = require('../../server/gmail/helpers');

const chalk = require('chalk');
const simpleParser = require('mailparser').simpleParser;
const moment = require('moment');

const headers = token => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'google-api-nodejs-client/0.10.0',
  host: 'www.googleapis.com',
  accept: 'application/json'
});

const deleteMessage = ({ id, accessToken }) => {
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/trash`;
  return fetch(url, {
    method: 'POST',
    headers: headers(accessToken)
  });
};

const prettyPrint = text => {
  console.log(chalk.greenBright(text));
};

const parseMessage = raw => {
  const subject = raw.payload.headers.find(header => header.name === 'Subject').value;
  const messageId = raw.payload.headers.find(header => header.name === 'Message-Id').value;
  const sender = raw.payload.headers.find(header => header.name === 'From').value;
  const to = raw.payload.headers.find(header => header.name === 'To').value;

  return { subject, messageId, from: sender, to };
};

const quickMailParse = source => simpleParser(source);

const parseAndFormatMail = (() => {
  var _ref = _asyncToGenerator(function* (source) {
    const mail = yield simpleParser(source);
    mail.html = 'undefined';
    mail.textAsHtml = 'undefined';
    const lines = [];
    for (key in mail) {
      if (typeof mail[key] === 'string' && mail[key] !== 'undefined') {
        lines.push(`${chalk.green(`${key}: `)}${mail[key]}`);
      } else if (mail[key].hasOwnProperty('value')) {
        lines.push(`${chalk.green(`${key}: `)}${mail[key].value[0].address}`);
      }
    }
    return lines;
  });

  return function parseAndFormatMail(_x) {
    return _ref.apply(this, arguments);
  };
})();

const printHeader = (account, messages) => {
  console.log(chalk.bold(`Welcome ${account.emailAddress}!`));
  console.log(chalk.bold(`Total messages: ${account.messagesTotal}`));
  console.log(chalk.bold(`Token expires on ${moment(account.tokens.expiry_date, 'x').format()}`));
  console.log(chalk.yellow(`Messages in view: ${messages.length}`));
};

module.exports = {
  deleteMessage,
  headers,
  prettyPrint,
  printHeader,
  parseMessage,
  quickMailParse,
  parseAndFormatMail,
  saveMessagesInMemory
};