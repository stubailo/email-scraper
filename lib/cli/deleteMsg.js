const google = require('googleapis');
const gmail = google.gmail({ version: 'v1' });

module.exports = function (messageId) {
  gmail.users.messages.trash({
    auth: this.oauth2Client,
    userId: 'me',
    id: messageId
  });
  this.messages[messageId].trash = true;
};