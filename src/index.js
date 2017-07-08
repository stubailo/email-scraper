#!/usr/bin/env node
const gmailCli = require('./cli');
const fs = require('fs');
const chalk = require('chalk')

function setup (fname) {
  return new Promise ((resolve, reject) => {
    fs.readFile(fname, 'utf-8', (err, json) => {
      if(err) {
        resolve(false)
      } else {
        let data = JSON.parse(json);
        resolve (data)
      }
    })
  })
}

async function init () { 
  var creds = await setup('./credentials.json')
  var prefs = await setup('./prefs.json')

  if(creds && prefs) {
    gmailCli(prefs.accounts);
  } else {
    console.log(chalk.bold("Authorizing..."))
    var client = require('./server/gmail/oauth2Client');
    var oauth2Client = await client()
    require('./server')
  }
}

init()