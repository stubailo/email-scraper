const google = require('googleapis');

const OAuth2 = google.auth.OAuth2;
const inquirer = require('inquirer');
const asyncStore = require('async-store');

const getCredentials = () => new Promise((resolve, reject) => {
  asyncStore({ filename: './credentials.json' }).then((resp) => {
    resolve(resp.web);
  }).catch((err) => {
    inquirer.prompt([{
      type: 'input',
      name: 'client_id',
      message: 'client_id',
    }, {
      type: 'input',
      name: 'client_secret',
      message: 'client_secret',
    }, {
      type: 'input',
      name: 'redirect_uris',
      message: 'redirect_uris',
      default: 'http://localhost:3000/callback',
    }]).then((answers) => {
      const { client_id, client_secret, redirect_uris } = answers;
      const data = {
        web: {
          client_id,
          client_secret,
          redirect_uris: [redirect_uris],
        },
      };
      asyncStore({ filename: './credentials.json', data });
      resolve(data.web);
    });
  });
});

module.exports = async function () {
  const client = await getCredentials();
  const oauth2Client = new OAuth2(
    client.client_id,
    client.client_secret,
    client.redirect_uris[0],
  );

  return oauth2Client;
};
