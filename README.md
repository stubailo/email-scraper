# gmail-cli [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> cli for gmail

## Installation

```sh
$ npm install -g gmail-cli
```

## Usage

```bash
gmail-cli
```

## Setup

Requires a client_id, client_secret, and redirect_uris. 

client_id and secret can be obtained for Google's Gmail API here: [https://console.developers.google.com/start/api?id=gmail](https://console.developers.google.com/start/api?id=gmail)

### Walk-through

These are the steps to get programmatic access to the Gmail API.

Start here [https://console.developers.google.com/start/api?id=gmail](https://console.developers.google.com/start/api?id=gmail)

#### Step 1

![step-1](https://github.com/unshift/gmail-cli/blob/master/images/step-1.png?raw=true)

Click continue.

#### Step 2

![step-2](https://github.com/unshift/gmail-cli/blob/master/images/step-2.png?raw=true)

Click go to credentials.

#### Step 3

![step-3](https://github.com/unshift/gmail-cli/blob/master/images/step-3.png?raw=true)

Select user data.

#### Step 4

![step-4](https://github.com/unshift/gmail-cli/blob/master/images/step-4.png?raw=true)

Add http://localhost:3000 to authorized origins.
Add http://localhost:3000/callback to authorized callbacks.

#### Step 5

![step-5](https://github.com/unshift/gmail-cli/blob/master/images/step-5.png?raw=true)

Download credentials.

They should look like:
```js
{
  "web": {
    "client_id": "1234567891011-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
    "project_id": "amiable-dynamo-1234567",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "s6jqlmn72hyq82hbcvaa2",
    "redirect_uris": ["http://localhost:3000/callback"],
    "javascript_origins": ["http://localhost:3000"]
  }
}
```

## License
MIT © [Ben](https://www.menubar.io)


[npm-image]: https://badge.fury.io/js/gmail-cli.svg
[npm-url]: https://npmjs.org/package/gmail-cli
[travis-image]: https://travis-ci.org/unshift/gmail-cli.svg?branch=master
[travis-url]: https://travis-ci.org/unshift/gmail-cli
[daviddm-image]: https://david-dm.org/unshift/gmail-cli.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/unshift/gmail-cli
[coveralls-image]: https://coveralls.io/repos/unshift/gmail-cli/badge.svg
[coveralls-url]: https://coveralls.io/r/unshift/gmail-cli
