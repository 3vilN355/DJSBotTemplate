let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Reloads a part of the bot.',
      emitError: true,
      aliases:['r'],
      flags:[
        {
          flag: 'type',
          args: 1
        }
      ],
    });
  }
  async run(message, permCalc, args){
    if (!args[0]) return this.error(1, message.settings.prefix);
    
    if (message.flags.type) {
      // This is a big reload
      let type = message.flags.type[0];
      if(type == 'event'){
        // Reload an event
        let allowedEvents = ['message'];
        if(allowedEvents.includes(args[0])){
          delete require.cache[require.resolve(`../../events/${args[0]}`)];
          this.client.removeAllListeners([args[0]]);
          let event = require(`../../events/${args[0]}`);
          this.client.on(args[0], event.bind(null, this.client));
        } else {
          return this.error(0, 'No such event listener');
        }
        return {description: `${args[0]} listener reloaded`};
      } else if(type == 'util'){
        // TODO Before deleting from cache, remove all old functions from the file
        delete require.cache[require.resolve(`${process.cwd()}/util/clientFuncs.js`)];
        require('../../../util/functions')(this.client);
        return {description: 'Util reloaded'};
      } else return this.error(0, 'There\'s no such type');
    } else {
      try {
        this.client.unloadCommand(args[0]);
        return {description: `Reloaded command \`${args[0]}\``, color:'GREEN'};
      } catch (e) {
        return this.error(0, `Error while reloading command: ${e.message}`);
      }
    }
  }
};