#!/usr/bin/env node
const chalk = require('chalk')
const Gmail = require('./cli/gmail')
const db = require('./cli/db')

async function init () {
  let accounts = db.get('prefs.accounts').value()

  if (accounts) {
    await (new Gmail(accounts)).homeMenu()
  } else {
    console.log(chalk.bold('Authorizing...'))
    await require('./server/gmail/oauth2Client')()
    require('./server')
  }
}

init()
