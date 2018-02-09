const {
  getMessagesList,
  getEmails
} = require('../server/gmail/gmailClient')
const db = require('./db')
const moment = require('moment')

async function fetchMessagesAndSetState ({count, next}) {
  const CACHE_TIME = 5 * 60 * 1000

  const { accessToken, searchFilter } = this

  const resp = await getMessagesList({ accessToken, next, filter: searchFilter })
  const start = count - 10 >= 0 ? count - 10 : 0

  this.next = resp.next

  const store = db.get('messages')

  const input = resp.messages.slice(start, count)
    .filter(message =>
      !store.find({id: message.id}).value()
    )

  if (input && input.length > 0) {
    const messages = await getEmails({
      accessToken,
      count,
      messages: input,
      format: 'full'
    })

    messages.forEach(message => {
      store.push({
        id: message.id,
        message,
        show: true,
        page: this.currentPage,
        timestamp: moment().format('x')
      }).write()
    })
  }
}

module.exports = fetchMessagesAndSetState
