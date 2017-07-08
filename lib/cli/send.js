const chalk = require('chalk');
const btoa = require('btoa');
const google = require('googleapis');

const gmail = google.gmail({ version: 'v1' });

module.exports = function send({ text, from, to, subject, threadId }) {
  const arr = ['Content-Type: text/plain; charset=\"UTF-8\"', 'MIME-Version: 1.0', `Subject: ${subject}`, `From: ${to}`, `To: ${from}\n`, `${text}`];
  console.log(chalk.cyan(arr.join('\n')));
  const base64EncodedEmail = btoa(arr.join('\n')).replace(/\+/g, '-').replace(/\//g, '_');

  gmail.users.messages.send({
    auth: this.oauth2Client,
    userId: 'me',
    resource: {
      raw: base64EncodedEmail,
      threadId
    }
  });
};