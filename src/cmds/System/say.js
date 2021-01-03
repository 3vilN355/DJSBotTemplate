let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Repeats whatever the user said',
      emitError: true,
      usage: '<Repeat string>',
      flags: [{
        flag: 'e',
      },{
        flag: 'color',
        args: 1,
      },{
        flag: 'title',
        untilNextFlag: true,
      }]
    });
  }
  async run(message, permCalc, args){
    if(!args[0] && !(message.flags.e && message.flags.title)) return this.error(1, message.settings.prefix);
    if(message.flags.e){
      let emb = {description:args.join(' ')};
      if(message.flags.color){
        emb.color = message.flags.color[0].toUpperCase();
      }
      if(message.flags.title){
        emb.title = message.flags.title.join(' ');
      }
      return emb;
    } else message.channel.send(args.join(' '));
  }
};
