function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inquirer = require('inquirer');
const emoji = require('node-emoji');

var options = [new inquirer.Separator(), { name: 'Home', value: 'home' }, { name: 'Exit', value: 'exit' }, { name: 'Search', value: 'search' }, { name: 'Bulk', value: 'bulk' }, { name: `Compose ${emoji.get('email')}`, value: 'compose' }];
module.exports = (() => {
  var _ref = _asyncToGenerator(function* (choices, type = 'list') {
    const { currentPage } = this;
    const nextPage = `Page ${currentPage + 1} (next) ${emoji.get('arrow_forward')}`;
    choices.unshift(new inquirer.Separator());
    choices = choices.concat(options);
    if (currentPage > 1) {
      const prevPage = `Page ${currentPage - 1} (previous) ${emoji.get('arrow_backward')}`;
      choices.unshift({ name: prevPage, value: currentPage - 1 });
    }
    choices.unshift({ name: nextPage, value: currentPage + 1 });

    return yield inquirer.prompt([{
      name: 'menu',
      type,
      message: 'Inbox',
      pageSize: 20,
      choices
    }]);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();