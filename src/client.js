const fetch = require('node-fetch')
const oauth2Client = require('./auth')

const headers = token => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'google-api-nodejs-client/0.10.0',
  host: 'www.googleapis.com',
  accept: 'application/json'
})

function handleParams ({
  base = 'https://www.googleapis.com',
  params = null,
  endpoint = '/'
}) {
  let url = base + endpoint
  if (!params) return url
  url += '?'
  return url + Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
}

function createFetch (params) {
  const { accessToken } = params
  const url = handleParams(params)
  return fetch(url, {
    method: 'get',
    headers: headers(accessToken)
  })
    .then(resp => resp.json())
}

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
      if (err) { reject(err) }
      resolve({ tokens })
    })
  })
}

const getProfile = accessToken => createFetch({
  accessToken,
  endpoint: '/gmail/v1/users/me/profile'
})

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

module.exports = {
  loginUrl,
  getToken,
  getEmails,
  getEmail,
  getMessagesList,
  getProfile
}
