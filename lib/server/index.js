function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const express = require('express');
const bodyParser = require('body-parser');
const opn = require('opn');

const app = express();
const { getEmails, getToken, getProfile, loginUrl } = require('./gmail/gmailClient.js');
const Gmail = require('../cli/gmail');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.json());

app.get('/authorize-gmail', (() => {
  var _ref = _asyncToGenerator(function* (req, res) {
    const url = yield loginUrl();
    res.redirect(url);
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());

app.get('/callback', (() => {
  var _ref2 = _asyncToGenerator(function* (req, res) {
    const { code } = req.query;
    const { tokens } = yield getToken(code);
    const profile = yield getProfile(tokens.access_token);
    res.send('<script> window.close(); </script>');
    fs.readFile('./prefs.json', 'utf-8', function (err, json) {
      if (err) {
        const data = JSON.stringify({
          accounts: { [profile.emailAddress]: Object.assign(profile, { tokens }) }
        });
        fs.writeFile('./prefs.json', data, function (err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        const data = JSON.parse(json);
        data.accounts[profile.emailAddress] = Object.assign(profile, { tokens });
        const prefs = JSON.stringify(data);
        fs.writeFile('./prefs.json', prefs, function (err) {
          if (err) {
            console.log(err);
          }
          var gmail = new Gmail(data.accounts);
          gmail.homeMenu();
        });
      }
    });
    //server.close()
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})());

var server = app.listen(process.env.PORT || 3000, () => {
  opn('http://localhost:3000/authorize-gmail');
});