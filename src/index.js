// Turn on ES6 modules
require("reify");

const chalk = require("chalk");
const auth = require("./auth").default;
const runScript = require("./runScript");
const { prefs } = require("./prefs");

(async () => {
  let accounts = prefs.accounts;
  if (accounts) {
    if (Object.keys(accounts).length === 1) {
      runScript(accounts[Object.keys(accounts)[0]]).catch(e => {
        console.error("error", e);
      });
    }

    return;
  } else {
    console.log(chalk.bold("Authorizing..."));
    await auth();
    require("./server");
    // TODO run the script after authorizing
  }
})();
