#!/usr/bin/env node
let setup = (() => {
  var _ref = _asyncToGenerator(function* (fname) {
    var json = yield readFile(fname);
    return JSON.parse(json);
  });

  return function setup(_x) {
    return _ref.apply(this, arguments);
  };
})();

let init = (() => {
  var _ref2 = _asyncToGenerator(function* () {
    var creds = yield setup('./credentials.json');
    var prefs = yield setup('./prefs.json');

    if (creds && prefs) {
      var gmail = new Gmail(prefs.accounts);
      yield gmail.homeMenu();
    } else {
      console.log(chalk.bold("Authorizing..."));
      var client = require('./server/gmail/oauth2Client');
      var oauth2Client = yield client();
      require('./server');
    }
  });

  return function init() {
    return _ref2.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const chalk = require('chalk');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const Gmail = require('./cli/gmail');

init();