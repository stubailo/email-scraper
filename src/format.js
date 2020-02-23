const base64 = require("js-base64").Base64;

// Need to recursively unroll structure like:

// part = {
//   mimeType: "text/html", // or "multipart/related"
//   body: {
//     size: int,
//     data: "<base64>"
//   },
//   parts: [part] // unclear if both body and parts can coexist...
// };

// {
//   message: {
//     payload: part;
//   }
// }

const formatMessage = message => {
  let content;
  let headers = {};
  const { payload } = message;
  if (payload) {
    if (payload.headers) {
      headers = payload.headers.reduce((acc, { name, value }) => {
        acc[name.toLowerCase()] = value;
        return acc;
      }, {});
    }
  }

  if (payload) {
    const parts = payload.parts || [{ body: payload.body }];
    if (parts && parts.length && parts[0].body) {
      paragraphs = base64.decode(parts[0].body.data);
    }
  }
  const { id, historyId, snippet, internalDate, labelIds } = message;
  return {
    ...message,
    headers,
    paragraphs
  };
};

module.exports = messages => messages.map(formatMessage);
