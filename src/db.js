const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const home = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']

const adapter = new FileSync(path.join(home, 'gmail.json'))
const db = low(adapter)

db.defaults({ prefs: {}, credentials: {}, pages: {}, messages: [] })
  .write()

module.exports = (function () {
  return db
})()
