let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: false,
      description: 'Gives information about other commands!',
      emitError: true,
    });
  }
  // eslint-disable-next-line no-unused-vars
  async run(message, permCalc, args){

  }
};