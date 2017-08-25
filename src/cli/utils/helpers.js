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
    headers: headers(accessToken),
  });
};

const prettyPrint = (text) => {
  console.log(chalk.greenBright(text));
};

const parseMessage = (raw) => {
  const subject = raw.payload.headers.find(header => header.name === 'Subject').value;
  const messageId = raw.payload.headers.find(header => header.name === 'Message-Id').value;
  const sender = raw.payload.headers.find(header => header.name === 'From').value;
  const to = raw.payload.headers.find(header => header.name === 'To').value;

  return { subject, messageId, from: sender, to };
};

const parseAndFormatMail = async (source) => {
  const mail = await simpleParser(source)
  mail.html = 'undefined'
  mail.textAsHtml = 'undefined'
  const lines = []
  for(key in mail) {
    if (typeof mail[key] === 'string' && mail[key] !== 'undefined') {
      lines.push(`${chalk.green(`${key}: `)}${mail[key]}`)

    } else if (mail[key].hasOwnProperty('value')) {
      lines.push(`${chalk.green(`${key}: `)}${mail[key].value[0].address}`)
    }
  }
  return lines
}

async function saveMessagesInMemory(count) {
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in ms

  const { accessToken, next, searchFilter } = this

  const resp = await getMessagesList({ accessToken, next, filter: searchFilter })
  const start = count - 20 >= 0 ? count - 20 : 0;

  const input = resp.messages.slice(start, count)
    .filter(message =>
      !this.messages[message.id] ||
      this.messages[message.id].timestamp + CACHE_TIME <= parseInt(moment().format('x'))
    )

  if (input && input.length > 0) {
    const messages = await getEmails({
      accessToken,
      count,
      messages: input,
      format: 'full'
    })
    messages.forEach(message => {
      this.messages[message.id] = {
        message,
        show: true,
        timestamp: moment().format('x')
      }
    })
  }
}

const printHeader = (account, messages) => {
  console.log(chalk.bold(`Welcome ${account.emailAddress}!`))
  console.log(chalk.bold(`Total messages: ${account.messagesTotal}`))
  console.log(chalk.bold(`Token expires on ${moment(account.tokens.expiry_date, 'x').format()}`))
  console.log(chalk.yellow(`Messages in view: ${messages.length}`))
};

module.exports = {
  deleteMessage,
  headers,
  prettyPrint,
  printHeader,
  parseMessage,
  quickMailParse,
  parseAndFormatMail,
  saveMessagesInMemory,
};
