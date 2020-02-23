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

function formatMessage(message) {
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
  const content = unrollPart(payload);

  const { id, historyId, snippet, internalDate, labelIds } = message;

  return {
    ...message,
    headers,
    content
  };
}

// returns string with decoded contents of this part, recursively
function unrollPart(part) {
  if (!part) {
    return "";
  }

  let result = "";

  // TODO: do we need to inspect content that isn't type text/html
  if (part.body && part.body.size > 0 && part.mimeType === "text/html") {
    result += base64.decode(part.body.data);
  }

  if (part.parts) {
    result += part.parts.map(p => unrollPart(p)).join(" ");
  }

  return result;
}

export function formatMessages(messages) {
  return messages.map(formatMessage);
}
