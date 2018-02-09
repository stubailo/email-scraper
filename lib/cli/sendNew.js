const google = require('googleapis')

const gmail = google.gmail({ version: 'v1' })
const btoa = require('btoa')

module.exports = function ({ text, from, to, subject }) {
  console.log(this.oauth2Client)
  const arr = [
    'Content-Type: text/plain; charset=\"UTF-8\"',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    `From: ${to}`,
    `To: ${from}\n`,
    `${text}`
  ]
  const base64EncodedEmail = btoa(arr.join('\n')).replace(/\+/g, '-').replace(/\//g, '_')
  gmail.users.messages.send({
    auth: this.oauth2Client,
    userId: 'me',
    resource: { raw: base64EncodedEmail }
  })
}
