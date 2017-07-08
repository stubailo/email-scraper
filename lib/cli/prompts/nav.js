function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const { reply } = require('../constants');
const { parseAndFormatMail, quickMailParse } = require('../utils/helpers');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* ({ source, threadId, messageId }) {
    var _this = this;

    const arr = yield parseAndFormatMail(source);
    const mail = yield quickMailParse(source);

    this.ui.log.write(arr.join('\n'));
    inquirer.prompt(reply).then((() => {
      var _ref2 = _asyncToGenerator(function* (answers) {
        switch (true) {
          case answers.nav === 'back':
            yield _this.configureInboxView();
            break;
          case answers.nav === 'reply':
            _this.replyToMessage();
            break;
          case answers.nav === 'delete':
            _this.deleteMsg(messageId);
            yield _this.configureInboxView();
            break;
          case answers.nav === 'home':
            _this.homeMenu();
            break;
          case answers.nav === 'exit':
            process.exit();
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
  });

  function nav(_x) {
    return _ref.apply(this, arguments);
  }

  return nav;
})();