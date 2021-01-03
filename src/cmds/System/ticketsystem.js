let Command = require('../../classes/Command');
const TicketSystem = require('../../models/TicketSystem');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Initiates the creation of a new ticket system',
      emitError: true,
    });
  }
  // eslint-disable-next-line no-unused-vars
  async run(message, permCalc, args){
    const filter = m => m.author.id == message.author.id;
    let que = await message.channel.send('Which message would you like to use for these tickets?');
    let msg = (await message.channel.awaitMessages(filter, { max : 1 })).first();
    const msgID = msg.content;
    const fetchMsg = await message.channel.messages.fetch(msgID).catch(() => {});
    await msg.delete();
    await que.edit('What category would you like to start tickets in?');
    msg = (await message.channel.awaitMessages(filter, { max : 1 })).first();
    const categID = msg.content;
    const categCH = await message.guild.channels.cache.get(categID);
    await msg.delete();
    await que.edit('Which roles should have access to these tickets? (comma-separated)');
    msg = (await message.channel.awaitMessages(filter, { max : 1 })).first();
    const roles = msg.content.split(/,\s*/g);
    await msg.delete();
    if(fetchMsg && categCH){
      for(const roleID of roles)
        if (!message.guild.roles.cache.has(roleID)) throw new Error(`Role ${roleID} does not exist`);
      
      await (new TicketSystem({
        messageID: msgID,
        guildID: message.guild.id,
        roles,
        parentID: categCH.id,
      }).save());

      await fetchMsg.react('🎫');
      return {description:'Successfully created ticket system!'};
    } else return this.error(0, 'Was given invalid message ID or category ID.\nPlease make sure you\'re using the command in the channel of the message!');
    
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Owner',
};