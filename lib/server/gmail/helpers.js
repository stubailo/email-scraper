const base64 = require('js-base64').Base64;

function extractEmailAddr(data) {
  const re = /[\w0-9-_]+@[\w0-9-_]+\.[\w0-9-_]+/;
  if (!Array.isArray(data)) {
    const { headers } = data;
    return headers && headers.From && headers.From.match(re) ? data.headers.From.match(re)[0] : null;
  }

  return data.map(x => {
    if (x.headers && x.headers.From && x.headers.From.match(re)) {
      return x.headers.From.match(re)[0];
    }
  });
}

function frequency(arr) {
  const frequency = {};
  arr.forEach(string => {
    frequency[string] = frequency[string] ? frequency[string] += 1 : 1;
  });
  return Object.keys(frequency).map(key => ({ label: key, count: frequency[key] })).sort((a, b) => b.count - a.count);
}

function filterEmails(data, filter) {
  let result;
  switch (filter) {
    case 'read':
      result = data.filter(a => a.labelIds.indexOf('UNREAD') < 0);
      break;
    case 'unread':
      result = data.filter(a => a.labelIds.indexOf('UNREAD') > -1);
      break;
  }
  return result;
}

const parseMessages = messages => messages.map(message => {
  let paragraphs;
  const headers = {};
  const labels = ['Date', 'Subject', 'From', 'To'];
  const payload = message.payload;
  if (payload && payload.parts && payload.parts[0].body) {
    const bodyData = payload.parts[0].body.data;
    paragraphs = base64.decode(bodyData);
  }
  if (payload && payload.headers) {
    labels.forEach(name => {
      const header = payload.headers.find(header => header.name === name);
      headers[name.toLowerCase()] = header && header.value ? header.value : null;
    });
  }
  const { id, historyId, snippet, internalDate, labelIds } = message;
  return {
    headers,
    paragraphs,
    id,
    historyId,
    snippet,
    internalDate,
    labelIds
  };
});

module.exports = {
  filterEmails,
  frequency,
  extractEmailAddr,
  parseMessages
};