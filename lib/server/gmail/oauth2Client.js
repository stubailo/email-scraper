function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const google = require('googleapis');

const OAuth2 = google.auth.OAuth2;
const inquirer = require('inquirer');
const asyncStore = require('async-store');

const getCredentials = () => new Promise((resolve, reject) => {
  asyncStore({ filename: './credentials.json' }).then(resp => {
    resolve(resp.web);
  }).catch(err => {
    inquirer.prompt([{
      type: 'input',
      name: 'client_id',
      message: 'client_id'
    }, {
      type: 'input',
      name: 'client_secret',
      message: 'client_secret'
    }, {
      type: 'input',
      name: 'redirect_uris',
      message: 'redirect_uris',
      default: 'http://localhost:3000/callback'
    }]).then(answers => {
      const { client_id, client_secret, redirect_uris } = answers;
      const data = {
        web: {
          client_id,
          client_secret,
          redirect_uris: [redirect_uris]
        }
      };
      asyncStore({ filename: './credentials.json', data });
      resolve(data.web);
    });
  });
});

module.exports = _asyncToGenerator(function* () {
  const client = yield getCredentials();
  const oauth2Client = new OAuth2(client.client_id, client.client_secret, client.redirect_uris[0]);

  return oauth2Client;
});