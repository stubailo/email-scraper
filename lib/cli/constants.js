const reply = [
  {
    name: 'nav',
    type: 'list',
    message: 'Options',
    choices: [
      {
        name: 'Back',
        value: 'back'
      }, {
        name: 'Reply',
        value: 'reply'
      }, {
        name: 'Delete',
        value: 'delete'
      }, {
        name: 'Home',
        value: 'home'
      }, {
        name: 'Exit',
        value: 'exit'
      }
    ]
  }
]

const home = [{
  name: 'home',
  type: 'list',
  message: 'Home',
  choices: ['Inbox', 'Settings', 'Re-Authorize', 'Exit']
}]

const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const create = [
  {
    type: 'input',
    name: 'recipient',
    message: 'Recipient',
    validate (answer) {
      if (emailRegEx.test(answer)) {
        return true
      }
      return 'Not a valid email :('
    }
  }, {
    type: 'input',
    name: 'subject',
    message: 'Subject',
    validate (answer) {
      if (answer.length < 1) {
        return 'Cannot be blank!'
      }
      return true
    }
  }, {
    type: 'input',
    name: 'text',
    message: 'Message',
    validate (answer) {
      if (answer.length < 1) {
        return 'Cannot be blank!'
      }
      return true
    }
  }
]

module.exports = {
  reply,
  home,
  create
}
