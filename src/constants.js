const HOME = {
  name: "handleMain",
  type: "list",
  message: "Home",
  choices: [
    { name: "Inbox", value: "inbox" },
    { name: "Compose", value: "compose" },
    { name: "Settings", value: "settings" },
    { name: "Re-Authorize", value: "authorize" },
    { name: "Exit", value: "exit" }
  ]
};

module.exports = {
  HOME
};
