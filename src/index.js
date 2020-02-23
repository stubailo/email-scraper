// Turn on ES6 modules
require("reify");

const chalk = require("chalk");
const db = require("./db");
const auth = require("./auth");
const runScript = require("./runScript");

const clear = () => {
  db.set("messages", [])
    .set("pages", {})
    .write();
};

(async () => {
  clear();
  let accounts = db.get("prefs.accounts").value();
  if (accounts) {
    if (Object.keys(accounts).length === 1) {
      runScript(accounts[Object.keys(accounts)[0]])
        .then((...args) => {
          console.log("result", ...args);
        })
        .catch(e => {
          console.error("error", e);
        });
    }

    return;
  } else {
    console.log(chalk.bold("Authorizing..."));
    await auth();
    require("./server");
  }
})();
