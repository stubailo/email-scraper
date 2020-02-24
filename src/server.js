const http = require("http");
const opn = require("opn");
const url = require("url");
import default as oauth2Client, { credentials } = require("./auth");
import { Gmail } from "./gmail";
const db = require("./db");
const createFetch = require("./create-fetch");

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
  db.set("prefs.accounts", accounts).write();
  let gmail = new Gmail(accounts);
  gmail.renderMain();
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<script> window.close(); </script>");
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
