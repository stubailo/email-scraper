const fetch = require("node-fetch");
const chalk = require("chalk");
const simpleParser = require("mailparser").simpleParser;

const headers = token => ({
  Authorization: `Bearer ${token}`,
  "User-Agent": "google-api-nodejs-client/0.10.0",
  host: "www.googleapis.com",
  accept: "application/json"
});

const deleteMessage = ({ id, accessToken }) => {
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${id}/trash`;
  return fetch(url, {
    method: "POST",
    headers: headers(accessToken)
  });
};

const prettyPrint = text => {
  console.log(chalk.greenBright(text));
};

const parseAndFormatMail = async source => {
  const mail = await simpleParser(source);
  mail.html = "undefined";
  mail.textAsHtml = "undefined";
  const lines = [];
  for (let key in mail) {
    if (typeof mail[key] === "string" && mail[key] !== "undefined") {
      lines.push(`${chalk.green(`${key}: `)}${mail[key]}`);
    } else if (mail[key].hasOwnProperty("value")) {
      lines.push(`${chalk.green(`${key}: `)}${mail[key].value[0].address}`);
    }
  }
  return lines;
};

const printHeader = (account, messages) => {
  console.log(chalk.bold(`Welcome ${account.emailAddress}!`));
  console.log(chalk.bold(`Total messages: ${account.messagesTotal}`));
  console.log(chalk.yellow(`Messages in view: ${messages.length}`));
};

module.exports = {
  deleteMessage,
  headers,
  prettyPrint,
  printHeader,
  parseAndFormatMail
};
