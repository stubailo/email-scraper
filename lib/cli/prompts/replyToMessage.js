function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = (() => {
  var _ref = _asyncToGenerator(function* (mail, threadId) {
    var answers = yield inquirer.prompt([{
      type: 'input',
      name: 'subject',
      message: 'Subject',
      default: mail && mail.subject ? mail.subject : ''
    }, {
      type: 'input',
      name: 'to',
      message: 'To',
      default: mail && mail.from && mail.from.value[0].address ? mail.from.value[0].address : ''
    }, {
      type: 'input',
      name: 'draft',
      message: 'Compose message'
    }, {
      type: 'confirm',
      name: 'confirmation',
      message: 'Send?'
    }]);
    if (answers.confirmation) {
      const text = answers.draft;
      const { to, subject } = answers;
      this.send({ text, subject, to, threadId, from: this.account.emailAddress });
      console.log(chalk.green('Success!'));
    }
    this.configureInboxView();
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();