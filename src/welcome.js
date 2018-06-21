const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')

module.exports = (clearfix = true, cachedMessagesCount = 0) => {
  if (clearfix) {
    clear()
  }
  console.log(
    chalk.cyan(
      figlet.textSync('gmail-cli', { horizontalLayout: 'full' })
    )
  )
  console.log(chalk.dim('Cached messages: ' + cachedMessagesCount))
}
