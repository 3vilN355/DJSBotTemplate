let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Some test command',
      emitError: true,
    });
  }
  async run(message, permCalc, args){
    args = await this.identifyArgs(...args);
    if(args) return {description: JSON.stringify(args)};
    return this.error(0, 'Boop');
  }
};