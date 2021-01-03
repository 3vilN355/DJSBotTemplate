let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: false,
      description: 'Gives information about other commands!',
      emitError: true,
    });
  }
  async run(message, permCalc, args){

  }
};