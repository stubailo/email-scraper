#!/usr/bin/env node
const fs = require('fs');
const chalk = require('chalk')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const Gmail = require('./cli/gmail')

async function setup (fname) {
  var json = await readFile(fname)
  return JSON.parse(json)
}

async function init () {
  var creds = await setup('./credentials.json')
  var prefs = await setup('./prefs.json')

  if(creds && prefs) {
    var gmail = new Gmail (prefs.accounts)
    await gmail.homeMenu()
  } else {
    console.log(chalk.bold("Authorizing..."))
    var client = require('./server/gmail/oauth2Client');
    var oauth2Client = await client()
    require('./server')
  }
}

init()
