const fetch = require('node-fetch')

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

module.exports = createFetch
