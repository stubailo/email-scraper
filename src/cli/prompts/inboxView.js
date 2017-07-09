const inquirer = require('inquirer');
const emoji = require('node-emoji');

var options = [
  new inquirer.Separator(),
  { name: 'Home', value: 'home' },
  { name: 'Exit', value: 'exit' },
  { name: 'Search', value: 'search' },
  { name: 'Bulk', value: 'bulk' },
  { name: `Compose ${emoji.get('email')}`, value: 'compose' }
]
module.exports = async function (choices, type = 'list') {
  const { currentPage } = this;
  const nextPage = `Page ${currentPage + 1} (next) ${emoji.get('arrow_forward')}`;
  choices.unshift(new inquirer.Separator());
  choices = choices.concat(options)
  if (currentPage > 1) {
    const prevPage = `Page ${currentPage - 1} (previous) ${emoji.get('arrow_backward')}`;
    choices.unshift({ name: prevPage, value: currentPage - 1 });
  }
  choices.unshift({ name: nextPage, value: currentPage + 1 });
  

  return await inquirer.prompt([{
    name: 'menu',
    type,
    message: 'Inbox',
    pageSize: 20,
    choices,
  }])
};
