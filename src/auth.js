const google = require('googleapis')
const OAuth2 = google.auth.OAuth2
const inquirer = require('inquirer')
const db = require('./db')

async function getCredentials () {
  let web = db.get('credentials.web').value()
  let config = db.get('credentials.config')
  if (!web) {
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
    let { port } = new URL(redirect_uris)

    web = {
      client_id,
      client_secret,
      redirect_uris: [redirect_uris]
    }
    config = { port }
    db.set('credentials.web', web).write()
    db.set('credentials.config', config).write()
  }
  return { web, config }
}

module.exports = async function () {
  const { web, config } = await getCredentials()
  const client = new OAuth2(
    web.client_id,
    web.client_secret,
    web.redirect_uris[0]
  )

  return client
}
