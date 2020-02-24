const oauth2Client = require("./auth").default;
const google = require("googleapis");
const createFetch = require("./create-fetch");
import { formatMessages } from "./format";

const gmail = google.gmail({ version: "v1" });

const pages = {};

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

  if (resp.error) {
    throw new Error(JSON.stringify(resp.error, null, 2));
  }

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

export default class Client {
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
    const next = pages[page] || undefined;
    const resp = await getMessagesList({
      accessToken: this.accessToken,
      next,
      filter
    });
    pages[page + 1] = resp.nextPageToken;
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
}

export async function getAllEmailsFromSearch(client, q, pageLimit) {
  let page = 1;
  let hasMoreMessages = true;
  let allEmails = [];

  while (hasMoreMessages && page < pageLimit) {
    const { messages, hasMore } = await client.fetchMessages(page, q);
    hasMoreMessages = hasMore;
    page++;
    allEmails = allEmails.concat(formatMessages(messages));
  }

  return allEmails;
}
