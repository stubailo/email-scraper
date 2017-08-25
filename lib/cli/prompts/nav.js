function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const { reply } = require('../constants');
const { parseAndFormatMail, quickMailParse } = require('../utils/helpers');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* ({ source, threadId, messageId }) {
    const lines = yield parseAndFormatMail(source);
    const mail = yield quickMailParse(source);

    this.ui.log.write(lines.join('\n'));
    var answers = yield inquirer.prompt(reply);

    switch (true) {
      case answers.nav === 'back':
        yield this.configureInboxView();
        break;
      case answers.nav === 'reply':
        this.replyToMessage(mail, threadId);
        break;
      case answers.nav === 'delete':
        this.deleteMsg(messageId);
        yield this.configureInboxView();
        break;
      case answers.nav === 'home':
        this.homeMenu();
        break;
      case answers.nav === 'exit':
        process.exit();
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();