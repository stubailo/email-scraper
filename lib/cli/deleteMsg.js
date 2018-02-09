const google = require('googleapis')
const gmail = google.gmail({ version: 'v1' })
const db = require('./db')

module.exports = function (messageId) {
  gmail.users.messages.trash({
    auth: this.oauth2Client,
    userId: 'me',
    id: messageId
  })

  db.get('messages').remove({id: messageId}).write()
  // this.messages[messageId].trash = true;
}
