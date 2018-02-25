const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const inquirer = require('inquirer')
const db = require('../../cli/db')

async function getCredentials () {
  let cred = db.get('credentials.web').value()
  if (!cred) {
    let answers = await inquirer.prompt([{
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
    }])

    let { client_id, client_secret, redirect_uris } = answers
    let web = {
      client_id,
      client_secret,
      redirect_uris: [redirect_uris]
    }
    db.set('credentials.web', web).write()

    return web
  } else {
    return cred
  }
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
