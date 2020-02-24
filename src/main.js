import auth from "./auth";
import { runScript } from "./runScript";
import { prefs } from "./prefs";

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
    console.log("Authorizing...");
    await auth();
    require("./server");
    // TODO run the script after authorizing
  }
})();
