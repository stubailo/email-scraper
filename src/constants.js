
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const REPLY = {
  name: 'handleMessage',
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

const HOME = {
  name: 'handleMain',
  type: 'list',
  message: 'Home',
  choices: [
    { name: 'Inbox', value: 'inbox' },
    { name: 'Settings', value: 'settings' },
    { name: 'Re-Authorize', value: 'authorize' },
    { name: 'Exit', value: 'exit' }
  ]
}

const CREATE = [{
  type: 'input',
  name: 'recipient',
  message: 'Recipient',
  validate (answer) {
    if (EMAIL_REGEX.test(answer)) {
      return true
    }
    return 'Not a valid email :('
  }
}, {
  type: 'input',
  name: 'subject',
  message: 'Subject',
  validate: (answer) => {
    if (answer.length < 1) {
      return 'Cannot be blank!'
    }
    return true
  }
}, {
  type: 'input',
  name: 'text',
  message: 'Message',
  validate: (answer) => {
    if (answer.length < 1) {
      return 'Cannot be blank!'
    }
    return true
  }
}]

module.exports = {
  REPLY,
  HOME,
  CREATE
}
