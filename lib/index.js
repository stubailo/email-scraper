#!/usr/bin/env node
const chalk = require('chalk')
const Gmail = require('./cli/gmail')
const db = require('./cli/db')
const auth = require('./server/gmail/auth')

async function init () {
  let accounts = db.get('prefs.accounts').value()

  if (accounts) {
    await (new Gmail(accounts)).homeMenu()
  } else {
    console.log(chalk.bold('Authorizing...'))
    await auth()
    require('./server')
  }
}

init()
