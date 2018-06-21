#!/usr/bin/env node
const chalk = require('chalk')
const Gmail = require('./gmail')
const db = require('./db')
const auth = require('./auth')

const clear = () => {
  db.set('messages', []).set('pages', {}).write()
}

async function init () {
  clear()
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
