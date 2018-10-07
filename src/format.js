const base64 = require('js-base64').Base64

const formatMessage = message => {
  let paragraphs
  let headers = {}
  const { payload } = message
  if (payload) {
    const { parts } = payload
    if (parts && parts.length && parts[0].body) {
      paragraphs = base64.decode(parts[0].body.data)
    }
    if (payload.headers) {
      headers = payload.headers.reduce((acc, { name, value }) => {
        acc[name.toLowerCase()] = value
        return acc
      }, {})
    }
  }
  const {
    id,
    historyId,
    snippet,
    internalDate,
    labelIds
  } = message
  return {
    headers,
    paragraphs,
    id,
    historyId,
    snippet,
    internalDate,
    labelIds
  }
}

module.exports = messages => messages.map(formatMessage)
