const express = require('express')
const bodyParser = require('body-parser')
const opn = require('opn')

const app = express()
const { getEmails, getToken, getProfile, loginUrl } = require('./gmail/gmailClient.js')
const Gmail = require('../cli/gmail')
const db = require('../cli/db')

app.use(bodyParser.json())

app.get('/authorize-gmail', async (req, res) => {
  let url = await loginUrl()
  res.redirect(url)
})

app.get('/callback', async (req, res) => {
  const { code } = req.query
  const { tokens } = await getToken(code)
  const profile = await getProfile(tokens.access_token)

  let accounts = {
    [profile.emailAddress]: {
      profile,
      tokens
    }
  }
  db.set('prefs.accounts', accounts).write()
  let gmail = new Gmail(accounts)
  gmail.homeMenu()
  res.send('<script> window.close(); </script>')
})

var server = app.listen(process.env.PORT || 3000, () => {
  opn('http://localhost:3000/authorize-gmail')
})
