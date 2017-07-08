const inquirer = require('inquirer');
const emoji = require('node-emoji');

module.exports = function (choices, type = 'list') {
  return new Promise((resolve, reject) => {
    const { currentPage } = this;
    const nextPage = `Page ${currentPage + 1} (next) ${emoji.get('arrow_forward')}`;
    choices.unshift(new inquirer.Separator());
    choices.unshift({ name: 'Home', value: 'home' });
    choices.unshift({ name: 'Exit', value: 'exit' });
    choices.unshift({ name: 'Search', value: 'search' });
    choices.unshift({ name: 'Bulk', value: 'bulk' });
    if (currentPage > 1) {
      const prevPage = `Page ${currentPage - 1} (previous) ${emoji.get('arrow_backward')}`;
      choices.unshift({ name: prevPage, value: currentPage - 1 });
    }
    choices.unshift({ name: nextPage, value: currentPage + 1 });
    choices.unshift({ name: `Compose ${emoji.get('email')}`, value: 'compose' });

    choices.unshift(new inquirer.Separator());

    inquirer.prompt([{
      name: 'menu',
      type,
      message: 'Inbox',
      pageSize: 20,
      choices
    }]).then(answers => {
      resolve(answers);
    });
  });
};