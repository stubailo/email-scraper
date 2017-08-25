function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('isomorphic-fetch');

const headers = token => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'google-api-nodejs-client/0.10.0',
  host: 'www.googleapis.com',
  accept: 'application/json'
});

function handleParams({
  base = 'https://www.googleapis.com',
  urlParams = null,
  endpoint = '/'
}) {
  let url = base + endpoint;
  if (!urlParams) return url;
  url += '?';
  return url += Object.keys(urlParams).map(key => `${key}=${encodeURIComponent(urlParams[key])}`).join('&');
}

function createFetch(params) {
  const { accessToken } = params;
  const url = handleParams(params);
  return new Promise((() => {
    var _ref = _asyncToGenerator(function* (resolve, reject) {
      const resp = yield fetch(url, { method: 'get', headers: headers(accessToken) });
      const json = yield resp.json();
      resolve(json);
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })());
}

module.exports = {
  createFetch,
  handleParams
};