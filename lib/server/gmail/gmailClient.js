const oauth2Client = require('./auth')
const { createFetch } = require('./createFetch')

const scopes = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
]

const loginUrl = async () => {
  const auth = await oauth2Client()
  return auth.generateAuthUrl({ access_type: 'offline', scope: scopes })
}

async function getToken (code) {
  const oauth = await oauth2Client()
  return new Promise((resolve, reject) => {
    oauth.getToken(code, (err, tokens) => {
      resolve({ tokens })
    })
  })
}

function getProfile (accessToken) {
  return createFetch({ accessToken, endpoint: '/gmail/v1/users/me/profile' })
}

async function getMessagesList (params) {
  const { accessToken } = params

  const state = {
    accessToken,
    endpoint: '/gmail/v1/users/me/messages',
    base: 'https://www.googleapis.com',
    urlParams: {}
  }

  if (params.filter &&
  typeof params.filter === 'string') state.urlParams.q = params.filter

  if (params.next) state.urlParams.pageToken = params.next

  const resp = await createFetch(state)
  const { messages, nextPageToken } = resp

  return { messages, next: nextPageToken }
}

async function getEmail (params) {
  const { accessToken, id, format = 'metadata' } = params
  const endpoint = `/gmail/v1/users/me/messages/${id}`
  return createFetch({ accessToken, endpoint, urlParams: { format } })
}

async function getEmails (params) {
  let { accessToken, messages, format } = params
  if (!messages || !messages.length || !messages.length > 0) throw new Error('Error')
  if (!format) format = 'metadata'

  return Promise.all(messages.map((message) => {
    const endpoint = `/gmail/v1/users/me/messages/${message.id}`
    return createFetch({ accessToken, endpoint, urlParams: { format } })
  }))
}

module.exports = {
  loginUrl,
  getToken,
  getEmails,
  getEmail,
  getMessagesList,
  getProfile
}
