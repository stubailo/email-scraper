#!/usr/bin/env node
let init = (() => {
  var _ref = _asyncToGenerator(function* () {
    var creds = yield setup('./credentials.json');
    var prefs = yield setup('./prefs.json');

    if (creds && prefs) {
      gmailCli(prefs.accounts);
    } else {
      console.log(chalk.bold("Authorizing..."));
      var client = require('./server/gmail/oauth2Client');
      var oauth2Client = yield client();
      require('./server');
    }
  });

  return function init() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const gmailCli = require('./cli');
const fs = require('fs');
const chalk = require('chalk');

function setup(fname) {
  return new Promise((resolve, reject) => {
    fs.readFile(fname, 'utf-8', (err, json) => {
      if (err) {
        resolve(false);
      } else {
        let data = JSON.parse(json);
        resolve(data);
      }
    });
  });
}

init();