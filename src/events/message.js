let PermissionCalculator = require('../../util/permissionCalculator');
let MessageFilter = require('../../util/messageFilter');
module.exports = async (client, message) => {
  // Is it a partial?
  if(message.partial) {
    // TODO Fetch it
  }
  // Any bot responses?
  if(message.author.bot) return;
  // Is the bot in dev mode?
  if(client.dev && !client.developers.includes(message.author.id)) return;
  // Is it a dm or guild message?
  let isDM = !message.guild;

  // Assign any necessary settings to the message
  if(client.settings.has(message.guild.id) && !isDM) message.settings = client.settings.get(message.guild.id);
  else message.settings = client.settings.get('default');

  // Should the message content be filtered?
  let filter = new MessageFilter(client, message);
  if(filter.shouldDelete) await message.delete();
  if(filter.shouldStop) return;

  let permCalc = new PermissionCalculator(client, message.settings, message.member);

  // Do the settings contain wildcards?
  if((message.settings.wildcards||[]).length > 0){
    // What are the wildcards?
    let wildcards = message.settings.wildcards;
    // Does the author of the message have the ability to use wildcards?
    if(permCalc.wildcards){
      // Does the message contain any wildcards?
      let filtered = message.content.split(' ').filter(arg => wildcards.find((wildcard) => wildcard.full == arg));
      if(filtered.length >= 1){
        // Lets turn the wildcards into the actual wildcards
        filtered = filtered.map(wc => wildcards.find((wildcard) => wildcard.full == wc));
        // There can not be more than 1 initiator wildcard
        if(filtered.reduce((acc, curr) => curr.initiator?acc+1:acc,0) <= 1){
          // Only one initiator wildcard identified. Proceed with running the wildcards
          // TODO
        }
      }
    }
  }

  // After doing wildcard shit, identify if the message is using a ping prefix
  if(message.settings.pingPrefixEnabled){
    if(new RegExp(`^<@!?${client.user.id}>`).test(message.content)){
      // We just replace the ping with the actual prefix in this case
      // I don't see a reason to make a catch for it
      message.content.replace(new RegExp(`^<@!?${client.user.id}>`), message.settings.prefix);
    }
  }
  
  // At this point, we filter out any non-commands

  if(message.content.indexOf(message.settings.prefix) !== 0) return;
  const args = message.content.slice(message.settings.prefix).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Is it a valid command?
  if(!client.commands.has(command) && !client.aliases.has(command)) return;

  message.flags = [];
  while (args[0] && args[0][0] === '-') {
    message.flags.push(args.shift().slice(1));
  }

  // Check if the permCalc allows for running this message
  if(!permCalc.allowsCommand(command)){
    // They're not allowed. Do they get a warning about it?
    if(permCalc.shouldAnnounceDeny){
      message.channel.send(permCalc.denyAnnouncement);
    }
  }
};
