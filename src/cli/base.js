const _ = require('lodash');
const CLI = require('clui');

const Spinner = CLI.Spinner;
const inquirer = require('inquirer');

const homeMenu = require('./prompts/homeMenu');
const inboxView = require('./prompts/inboxView');
const nav = require('./prompts/nav');

const replyToMessage = ('./prompts/replyToMessage');

const send = require('./send');
const sendNew = require('./sendNew');
const deleteMsg = require('./deleteMsg');
const showAccounts = require('./showAccounts');
const { saveMessagesInMemory } = require('./utils/helpers');

function Base() {
  const ui = new inquirer.ui.BottomBar();
  const status = new Spinner('Loading...');
  _.assign(this, {
    accessToken: null,
    currentPage: 1,
    searchFilter: null,
    next: null,
    account: null,
    messages: {},
    status,
    ui,
    saveMessagesInMemory,
    replyToMessage,
    showAccounts,
    sendNew,
    deleteMsg,
    homeMenu,
    inboxView,
    send,
    nav,
  });
}

module.exports = Base;
