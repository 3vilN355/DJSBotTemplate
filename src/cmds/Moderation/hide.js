let Command = require('../../classes/Command');

// const helpUI = 1;
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Hides specific channels for specific users',
      usage: '<#channel | channelID> <@user | userID>',
      emitError: true,
      permLevel: 4,
    });
  }
  // eslint-disable-next-line no-unused-vars
  async run(message, permCalc, args){
    // Identify first arg as channel id
    if(!args[1]) return this.error(1, message.settings.prefix);
    // Identify the args
    let channelID = await this.identifyArg(args[0], message.guild);
    if(!channelID || channelID.type != 'ChannelID') return this.error(2, message.settings.prefix);
    let userID = await this.identifyArg(args[1], message.guild);
    if(!userID || userID.type != 'UserID') return this.error(2, message.settings.prefix);
    // Just update the overwrites for the channel
    await message.guild.channels.cache.get(channelID.id).updateOverwrite(userID.id, {'VIEW_CHANNEL':false});
    return {color:'GREEN', description:`Successfully hid <#${channelID.id}> from <@${userID.id}>`};
  }
};