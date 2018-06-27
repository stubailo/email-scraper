const oauth2Client = require('./auth')
const google = require('googleapis')
const gmail = google.gmail({ version: 'v1' })
const btoa = require('btoa')
const chalk = require('chalk')
const db = require('./db')
const base64url = require('base64-url')
const createFetch = require('./create-fetch')

async function getMessagesList ({
  filter,
  next,
  accessToken
}) {
  const params = {
    maxResults: 10
  }
  if (filter) {
    params.q = filter
  }
  if (next) {
    params.pageToken = next
  }
  const { messages, nextPageToken } = await createFetch({
    accessToken,
    endpoint: '/gmail/v1/users/me/messages',
    base: 'https://www.googleapis.com',
    params
  })
  return { messages, nextPageToken }
}

async function getEmail (params) {
  const { accessToken, id, format = 'metadata' } = params
  const endpoint = `/gmail/v1/users/me/messages/${id}`
  return createFetch({ accessToken, endpoint, params: { format } })
}

async function getEmails ({ accessToken, messages, format }) {
  if (!format) format = 'metadata'

  return Promise.all(messages.map((message) => {
    const endpoint = `/gmail/v1/users/me/messages/${message.id}`
    return createFetch({ accessToken, endpoint, params: { format } })
  }))
}

class Client {
  constructor (oauth2Client, account) {
    oauth2Client.setCredentials(account.tokens)
    this.oauth2Client = oauth2Client
    this.accessToken = account.tokens.access_token
    this.account = account
  }

  static async create (account) {
    let auth = await oauth2Client()
    return new Client(auth, account)
  }

  send ({ text, sender, recipient, subject }) {
    const base64Encoded = btoa([
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${sender}`,
      `To: ${recipient}\n`,
      `${text}`
    ].join('\n')).replace(/\+/g, '-').replace(/\//g, '_')
    gmail.users.messages.send({
      auth: this.oauth2Client,
      userId: 'me',
      resource: { raw: base64Encoded }
    })
  }

  reply ({
    text,
    sender,
    recipient,
    subject,
    threadId
  }) {
    const arr = [
      'Content-Type: text/plain; charset=\"UTF-8\"',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      `From: ${sender}`,
      `To: ${recipient}\n`,
      `${text}`
    ]
    console.log(chalk.cyan(arr.join('\n')))
    const base64EncodedEmail = btoa(arr.join('\n'))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    gmail.users.messages.send({
      auth: this.oauth2Client,
      userId: 'me',
      resource: {
        raw: base64EncodedEmail,
        threadId
      }
    })
  }

  async fetchMessages (page, filter) {
    const store = db.get('messages')
    const next = db.get(`pages.${page}`, undefined).value()
    const resp = await getMessagesList({
      accessToken: this.accessToken,
      next,
      filter
    })
    db.set(`pages.${page + 1}`, resp.nextPageToken).write()

    let _messages = resp.messages.filter(message =>
      !store.find({id: message.id}).value()
    )

    if (_messages && _messages.length) {
      const messages = await getEmails({
        accessToken: this.accessToken,
        messages: _messages,
        format: 'full'
      })
      db.set(
        'messages',
        messages.concat(store.value()).sort((a, b) =>
          parseInt(b.internalDate) - parseInt(a.internalDate)
        )
      ).write()
    }
  }

  async getMessage (id) {
    let message = db.get('messages').find(message => message.id === id)
    let accessToken = this.account.tokens.access_token
    let raw = await getEmail({ accessToken, id, format: 'raw' })
    let source = base64url.decode(raw.raw)
    return {
      source,
      message,
      raw
    }
  }

  deleteMessage (messageId) {
    gmail.users.messages.trash({
      auth: this.oauth2Client,
      userId: 'me',
      id: messageId
    })
    db.get('messages').remove({id: messageId}).write()
  }
}

module.exports = Client
