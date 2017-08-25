require('isomorphic-fetch');

const headers = token => ({
  Authorization: `Bearer ${token}`,
  'User-Agent': 'google-api-nodejs-client/0.10.0',
  host: 'www.googleapis.com',
  accept: 'application/json',
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
  return new Promise(async (resolve, reject) => {
    const resp = await fetch(url, { method: 'get', headers: headers(accessToken) });
    const json = await resp.json();
    resolve(json);
  });
}

module.exports = {
  createFetch,
  handleParams,
};
