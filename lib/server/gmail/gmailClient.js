let getToken = (() => {
  var _ref2 = _asyncToGenerator(function* (code) {
    const oauth = yield oauth2Client();
    return new Promise(function (resolve, reject) {
      oauth.getToken(code, function (err, tokens) {
        resolve({ tokens });
      });
    });
  });

  return function getToken(_x) {
    return _ref2.apply(this, arguments);
  };
})();

let getMessagesList = (() => {
  var _ref3 = _asyncToGenerator(function* (params) {
    const { accessToken } = params;

    const state = {
      accessToken,
      endpoint: '/gmail/v1/users/me/messages',
      base: 'https://www.googleapis.com',
      urlParams: {}
    };

    if (params.filter && typeof params.filter === 'string') state.urlParams.q = params.filter;

    if (params.next) state.urlParams.pageToken = params.next;

    const resp = yield createFetch(state);
    const { messages, nextPageToken } = resp;

    return { messages, next: nextPageToken };
  });

  return function getMessagesList(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

let getEmail = (() => {
  var _ref4 = _asyncToGenerator(function* (params) {
    const { accessToken, id, format = 'metadata' } = params;
    const endpoint = `/gmail/v1/users/me/messages/${id}`;
    return createFetch({ accessToken, endpoint, urlParams: { format } });
  });

  return function getEmail(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

let getEmails = (() => {
  var _ref5 = _asyncToGenerator(function* (params) {
    let { accessToken, messages, format } = params;
    if (!messages || !messages.length || !messages.length > 0) throw new Error('Error');
    if (!format) format = 'metadata';

    return Promise.all(messages.map((() => {
      var _ref6 = _asyncToGenerator(function* (message) {
        const endpoint = `/gmail/v1/users/me/messages/${message.id}`;
        return createFetch({ accessToken, endpoint, urlParams: { format } });
      });

      return function (_x5) {
        return _ref6.apply(this, arguments);
      };
    })()));
  });

  return function getEmails(_x4) {
    return _ref5.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const oauth2Client = require('./oauth2Client');
const { createFetch } = require('./createFetch');
require('isomorphic-fetch');

const scopes = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.send'];

const loginUrl = (() => {
  var _ref = _asyncToGenerator(function* () {
    const auth = yield oauth2Client();
    return auth.generateAuthUrl({ access_type: 'offline', scope: scopes });
  });

  return function loginUrl() {
    return _ref.apply(this, arguments);
  };
})();

function getProfile(accessToken) {
  return createFetch({ accessToken, endpoint: '/gmail/v1/users/me/profile' });
}

module.exports = {
  loginUrl,
  getToken,
  getEmails,
  getEmail,
  getMessagesList,
  getProfile
};