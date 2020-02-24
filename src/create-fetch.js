const fetch = require("node-fetch");
const fs = require("fs");
import { getPersistentObject } from "./storage";

let cacheObj = getPersistentObject("gmail");

const headers = token => ({
  Authorization: `Bearer ${token}`,
  "User-Agent": "google-api-nodejs-client/0.10.0",
  host: "www.googleapis.com",
  accept: "application/json"
});

function handleParams({
  base = "https://www.googleapis.com",
  params = null,
  endpoint = "/"
}) {
  let url = base + endpoint;
  if (!params) return url;
  url += "?";
  return (
    url +
    Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&")
  );
}

function createFetch(params, cache = false) {
  const { accessToken } = params;
  const url = handleParams(params);

  if (cache) {
    const cached = cacheObj[`cached.${url}`];
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  console.log("hitting email API", url);
  return fetch(url, {
    method: "get",
    headers: headers(accessToken)
  })
    .then(resp => resp.json())
    .then(json => {
      if (cache) {
        cacheObj[`cached.${url}`] = json;
      }
      return json;
    });
}

module.exports = createFetch;
