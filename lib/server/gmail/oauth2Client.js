const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const inquirer = require('inquirer')
const db = require('../../cli/db')

function getCredentials () {
  return new Promise((resolve, reject) => {
    let cred = db.get('credentials.web').value()
    if (!cred) {
      inquirer.prompt([{
        type: 'input',
        name: 'client_id',
        message: 'client_id'
      }, {
        type: 'input',
        name: 'client_secret',
        message: 'client_secret'
      }, {
        type: 'input',
        name: 'redirect_uris',
        message: 'redirect_uris',
        default: 'http://localhost:3000/callback'
      }]).then(answers => {
        let { client_id, client_secret, redirect_uris } = answers
        let web = {
          client_id,
          client_secret,
          redirect_uris: [redirect_uris]
        }
        db.set('credentials.web', web).write()
        resolve(web)
      })
    } else {
      resolve(cred)
    }
  })
}

module.exports = async function () {
  const client = await getCredentials()
  const oauth2Client = new OAuth2(
    client.client_id,
    client.client_secret,
    client.redirect_uris[0]
  )

  return oauth2Client
}
