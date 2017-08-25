const express = require('express');
const bodyParser = require('body-parser');
const opn = require('opn');

const app = express();
const { getEmails, getToken, getProfile, loginUrl } = require('./gmail/gmailClient.js');
const gmailCli = require('../cli');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());

app.get('/authorize-gmail', async (req, res) => {
  const url = await loginUrl();
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await getToken(code);
  const profile = await getProfile(tokens.access_token);
  fs.readFile('./prefs.json', 'utf-8', (err, json) => {
    if (err) {
      const data = JSON.stringify({
        accounts: { [profile.emailAddress]: Object.assign(profile, { tokens }) }
      });
      fs.writeFile('./prefs.json', data, (err) => {
        if (err) { console.log(err); }
      });
    } else {
      const data = JSON.parse(json);
      data.accounts[profile.emailAddress] = Object.assign(profile, { tokens });
      const prefs = JSON.stringify(data);
      fs.writeFile('./prefs.json', prefs, (err) => {
        if (err) { console.log(err); }
        gmailCli(data.accounts);
      });
    }
  });

  res.send('<script> window.close(); </script>')
});

app.listen(process.env.PORT || 3000, () => {
  opn('http://localhost:3000/authorize-gmail');
});
