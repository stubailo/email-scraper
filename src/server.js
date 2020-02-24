const http = require("http");
const opn = require("opn");
const url = require("url");
import { default as oauth2Client, credentials } from "./auth";
const createFetch = require("./create-fetch");

import { prefs } from "./prefs";

async function getToken(code) {
  const oauth = await oauth2Client();
  return new Promise((resolve, reject) => {
    oauth.getToken(code, (err, tokens) => {
      if (err) {
        reject(err);
      }
      resolve({ tokens });
    });
  });
}

const getProfile = accessToken =>
  createFetch({
    accessToken,
    endpoint: "/gmail/v1/users/me/profile"
  });

const handler = async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (!req.url.startsWith("/callback")) return;
  const { tokens } = await getToken(parsed.query.code);
  const profile = await getProfile(tokens.access_token);

  let accounts = {
    [profile.emailAddress]: {
      profile,
      tokens
    }
  };

  prefs.accounts = accounts;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<script> window.close(); </script>");
  console.log("Authorized. Please run the script again");
  process.exit(0);
};

const server = http.createServer(handler);

const scopes = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send"
];

const { port = 3000 } = credentials.config;

server.listen(port, async () => {
  const auth = await oauth2Client();
  const url = await auth.generateAuthUrl({
    access_type: "offline",
    scope: scopes
  });
  opn(url);
});
