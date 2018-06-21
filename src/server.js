const http = require('http')
const opn = require('opn')
const getPort = require('get-port')
const url = require('url')
const oauth2Client = require('./auth')
const { PORT = 3000 } = process.env
const { getToken, getProfile } = require('./client')
const Gmail = require('./gmail')
const db = require('./db')

const handler = async (req, res) => {
  console.log(req.url)
  const parsed = url.parse(req.url, true)
  console.log(parsed)
  if (!req.url.startsWith('/callback')) return
  const { tokens } = await getToken(parsed.query.code)
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
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('<script> window.close(); </script>')
}

const server = http.createServer(handler)

const scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
]

getPort({ port: PORT }).then(port => {
  console.log('http://localhost:' + port)
  server.listen(port, async () => {
    const auth = await oauth2Client()
    const url = await auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    })
    opn(url)
  })
})
