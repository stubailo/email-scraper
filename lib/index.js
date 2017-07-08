#!/usr/bin/env node

const gmailCli = require('./cli');
const fs = require('fs');

function init() {
  fs.readFile('./prefs.json', 'utf-8', (err, json) => {
    if (!err) {
      const data = JSON.parse(json);
      gmailCli(data.accounts);
    } else {
      require('./server');
    }
  });
}

module.exports = init;