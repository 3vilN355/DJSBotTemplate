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
  if(!isDM){
    if(!client.settings.has(message.guild.id)){
      // Fetch the settings for this server
      try {
        await client.loadServerSettings(message.guild.id);
        message.settings = client.settings.get(message.guild.id);
      } catch (e) {
        message.settings = client.settings.get('default');
      }
    } else message.settings = client.settings.get(message.guild.id);
  } else message.settings = client.settings.get('default');

  // Should the message content be filtered?
  let filter = new MessageFilter(client, message);
  if(filter.shouldDelete) await message.delete();
  if(filter.shouldStop) return;

  let permCalc = new PermissionCalculator(client, message.settings, message.member);

  // Do the settings contain wildcards?
  message.oldContent = message.content;
  if((message.settings.wildcards||[]).length > 0){
    // What are the wildcards?
    let wildcards = message.settings.wildcards;
    // Does the author of the message have the ability to use wildcards?
    if(permCalc.useWildcards){
      // Does the message contain any wildcards?
      message.settings.wildcards.forEach(wildcard => {
        let smallReplace = wildcard.wildcard.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        let replaceRegex = smallReplace+' +([^ ]*)'.repeat(wildcard.argumentsToInclude);
        if((new RegExp(smallReplace)).test(message.content)) message.hasWildcard = true; 
        message.content = message.content.replace(new RegExp(replaceRegex), wildcard.replaceRegex);
      });
      let filtered = message.content.split(' ').filter(arg => wildcards.find((wildcard) => wildcard.full == arg));
      if(filtered.length >= 1){
        // Lets turn the wildcards into the actual wildcards
        filtered = filtered.map(wc => wildcards.find((wildcard) => wildcard.full == wc));
        // There can not be more than 1 initiator wildcard
        // if(filtered.reduce((acc, curr) => curr.initiator?acc+1:acc,0) <= 1){
        //   // Only one initiator wildcard identified. Proceed with running the wildcards
        //   // TODO
        // }
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

  // Test

  if(message.content.indexOf(message.settings.prefix) !== 0) return;
  let args = message.content.slice(message.settings.prefix).trim().split(/ +/g);
  const command = args.shift().toLowerCase().substring(message.settings.prefix.length);
  let oldArgs;
  if(message.hasWildcard){
    oldArgs = message.oldContent.slice(message.settings.prefix).trim().split(/ +/g);
  }

  // Is it a valid command?
  if(!client.commands.has(command) && !client.aliases.has(command)) return;

  let cmd;
  if(client.commands.has(command)) cmd = client.commands.get(command);
  else cmd = client.commands.get(client.aliases.get(command));

  // Is the command disabled?
  if(!cmd.enabled){
    // Do we have a disable reason?
    if(cmd.disableMessage) return message.channel.send(cmd.disableMessage);
  }

  let tempFlags = [];
  let tempMutex = Array.from(cmd.mutex||[]).map(m => { return {...m}; });
  let mutexClash = false;
  let registerArgsOntoFlag = false;
  let registerArgs = 0;
  // Do it with the new args
  args = args.filter((arg) => {
    if(/^-[^\-1-9][^ \n]*/.test(arg)){
      let flag = arg.slice(1);
      let found = cmd.flags.find(f => f.flag == flag);
      if(found){
        if(registerArgsOntoFlag) registerArgsOntoFlag = false;
        let mutex = tempMutex.find(mutex => mutex.flags.includes(flag));
        if(mutex){
          if(mutex.isFinished){
            // This mutex is already in use
            mutexClash = true;
            console.log(`For flag: ${flag}`, 'This mutex is already in use');
            return; // TODO Error
          }
          mutex.isFinished = true;
        }
        let f = {
          flag,
          args: [],
        };
        tempFlags.push(f);
        if(found.untilNextFlag) registerArgsOntoFlag = true;
        if(found.args) registerArgs = found.args;
        return !cmd.deleteFlagsFromArgs;
      }
    }
    if(registerArgsOntoFlag || registerArgs > 0){
      if(registerArgs > 0) registerArgs--;
      tempFlags[tempFlags.length-1].args.push(arg);
      return !cmd.deleteFlagsFromArgs;
    }
    return true;
  });
  
  // if we had wildcards, do it for the old args too
  if(message.hasWildcard){
    let oldTempFlags = [];
    let oldTempMutex = Array.from(cmd.mutex||[]).map(m => { return {...m}; });
    let oldRegisterArgsOntoFlag = false;
    let oldRegisterArgs = 0;
    // Do it with the new args
    oldArgs.forEach((arg) => {
      if(/^-[^\-1-9][^ \n]*/.test(arg)){
        let flag = arg.slice(1);
        let found = cmd.flags.find(f => f.flag == flag);
        if(found){
          if(oldRegisterArgsOntoFlag) oldRegisterArgsOntoFlag = false;
          let mutex = oldTempMutex.find(mutex => mutex.flags.includes(flag));
          if(mutex){
            if(mutex.isFinished){
              // This mutex is already in use
              console.log(`For flag: ${flag}`, 'This mutex is already in use');
              return; // TODO Error
            }
            mutex.isFinished = true;
          }
          let f = {
            flag,
            args: [],
          };
          oldTempFlags.push(f);
          if(found.untilNextFlag) oldRegisterArgsOntoFlag = true;
          if(found.args) oldRegisterArgs = found.args;
          return;
        }
      }
      if(oldRegisterArgsOntoFlag || oldRegisterArgs > 0){
        if(oldRegisterArgs > 0) oldRegisterArgs--;
        oldTempFlags[oldTempFlags.length-1].args.push(arg);
        return;
      }
      return;
    });

    message.oldFlags = {};
    oldTempFlags.forEach(flag => {
      message.oldFlags[flag.flag] = flag.args;
    });
  }
  if(mutexClash) return;

  message.flags = {};
  tempFlags.forEach(flag => {
    message.flags[flag.flag] = flag.args;
  });

  if(cmd.flags.filter(f => f.required).some(f => !Object.keys(message.flags).includes(f.flag)) ||
    tempMutex.some(mutex => mutex.required && !mutex.isFinished)){
    // At least one required flag wasn't recognized
    console.log('At least one required flag wasn\'t recognized');
    return;
  }



  // Check if the permCalc allows for running this message
  if(!permCalc.allowsCommand(command)){
    // They're not allowed. Do they get a warning about it?
    if(permCalc.shouldAnnounceDeny){
      // TODO
      message.channel.send(permCalc.denyAnnouncement);
    }
    return;
  }

  try {
    let res = await cmd.run(message, permCalc, args);
    if(res){
      await message.channel.send({embed:{color:'GREEN', ...res}});
    } 
  } catch (e) {
    if(cmd.emitError) await message.channel.send({embed: {color:'RED', author: {name: 'An error occured'}, description: e.message}});
    console.error(e);
  }
};
