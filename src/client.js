const oauth2Client = require("./auth");
const google = require("googleapis");
const gmail = google.gmail({ version: "v1" });
const btoa = require("btoa");
const chalk = require("chalk");
const db = require("./db");
const base64url = require("base64-url");
const createFetch = require("./create-fetch");

async function getMessagesList({ filter, next, accessToken }) {
  const params = {
    maxResults: 10
  };
  if (filter) {
    params.q = filter;
  }
  if (next) {
    params.pageToken = next;
  }
  const resp = await createFetch(
    {
      accessToken,
      endpoint: "/gmail/v1/users/me/messages",
      base: "https://www.googleapis.com",
      params
    },
    true
  );

  if (!resp.messages) {
    throw new Error(
      "no results returned from message list. params: " + JSON.stringify(params)
    );
  }

  return resp;
}

async function getEmail(params) {
  const { accessToken, id, format = "metadata" } = params;
  const endpoint = `/gmail/v1/users/me/messages/${id}`;
  return createFetch({ accessToken, endpoint, params: { format } });
}

async function getEmails({ accessToken, messages, format }) {
  if (!format) format = "metadata";

  return Promise.all(
    messages.map(message => {
      const endpoint = `/gmail/v1/users/me/messages/${message.id}`;
      return createFetch({ accessToken, endpoint, params: { format } }, true);
    })
  );
}

class Client {
  constructor(oauth2Client, account) {
    oauth2Client.setCredentials(account.tokens);
    this.oauth2Client = oauth2Client;
    this.accessToken = account.tokens.access_token;
    this.account = account;
  }

  static async create(account) {
    let auth = await oauth2Client();
    return new Client(auth, account);
  }

  async fetchMessages(page, filter) {
    const next = db.get(`pages.${page}`).value() || undefined;
    const resp = await getMessagesList({
      accessToken: this.accessToken,
      next,
      filter
    });
    db.set(`pages.${page + 1}`, resp.nextPageToken).write();
    db.set(`messages`, resp.messages).write();
    const emails = await getEmails({
      accessToken: this.accessToken,
      messages: resp.messages,
      format: "full"
    });
    return {
      messages: emails,
      hasMore: !!resp.nextPageToken
    };
  }

  async getMessage(id) {
    let message = db.get("messages").find(message => message.id === id);
    let accessToken = this.account.tokens.access_token;
    let raw = await getEmail({ accessToken, id, format: "raw" });
    console.log(raw);
    let source = base64url.decode(raw.raw);
    return {
      source,
      message,
      raw
    };
  }
}

module.exports = Client;
