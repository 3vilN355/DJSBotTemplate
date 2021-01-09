require('colors');
const moment = require('moment');
const Command = require('../src/classes/Command');
const Counter = require('../src/models/Counter');
module.exports = client => {
  client.developers = ['136985027413147648'];
  if(client.dev){
    // Assign developer IDs
    // I'm not sure where to store these so I'll just hardcode for now
    client.developers.push(['136985027413147648']);
  }

  client.log = (type, msg, title) => {
    if (!title) title = 'Log';
    else title = title.magenta.bold;
    if (!type) type = 'Null';
    if (['err', 'error'].includes(type.toLowerCase())) type = type.bgRed.white.bold;
  
    console.log(`[${moment().format('D/M/Y HH:mm:ss.SSS').bold.blue}] [${type.green}] [${title.yellow}] ${msg}`);
  };

  client.loadServerSettings = async (guildID) => {
    let settings = await client.dbHelper.getServerSettings(guildID).catch(console.trace);
    client.settings.set(guildID, settings);
  };

  client.unloadCommand = (commandName, reload = true) => {
    if(client.commands.has(commandName) || client.aliases.has(commandName)){
      let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
      let moduleName = command.module;
      if(moduleName == 'Unknown') throw new Error('Command is in unknown module!');
      else {
        delete require.cache[require.resolve(`${process.cwd()}/src/cmds/${moduleName}/${command.name}.js`)];
        for(let alias of command.aliases){
          client.aliases.delete(alias);
        }
        client.commands.delete(command.name);
        if(reload) client.loadCommand(moduleName, command.name);
      }
      return;
    }
    throw new Error('Command was not recognized!');
  };

  client.loadCommand = (moduleName, commandName) => {
    
    const commandFile = require(`../src/cmds/${moduleName}/${commandName}`);
    if (!client.isClass(commandFile)) throw new TypeError(`Command ${commandName} doesn't export a class.`);
    const command = new commandFile(client, moduleName, commandName.toLowerCase());
    if (!(command instanceof Command)) throw new TypeError(`Comamnd ${commandName} doesnt belong in Commands.`);
    if(client.commands.has(commandName)) throw new Error(`Command ${commandName} is already registered as a command`);
    client.commands.set(commandName, command);
    if (command.aliases.length) {
      for (const alias of command.aliases) {
        if(client.aliases.has(alias)) throw new Error(`Alias ${alias} is already set.`);
        client.aliases.set(alias, commandName);
      }
    }
  };

  client.getNext = async (_id) => {
    return (await Counter.findOneAndUpdate({_id}, {$inc:{num:1}}, {upsert:true, setDefaultsOnInsert:true, new:true}).lean()).num;
  };

  client.permLevel = (user, member) => {
    if(client.developers.includes(user.id)) return 15;
    if(!member) return 0;
    if(member.guild.ownerID == member.id) return 10;
    if(!client.settings.has(member.guild.id)) return 0;
    
    let sPermLevel = 0;
    for(let permLevel of client.settings.get(member.guild.id).permissionLevels.sort((a, b) => a.permLevel-b.permLevel)){
      if(sPermLevel) break;
      if(permLevel.roles.some(r => member.roles.cache.has(r))) sPermLevel = permLevel.permissionLevel;
    }
    if(sPermLevel < 7 && member.hasPermission(8)) return 7;
    else if(sPermLevel < 6 && member.hasPermission(32)) return 6;
    else return sPermLevel;
  };

  client.isClass = (input) => {
    return typeof input === 'function' &&
        typeof input.prototype === 'object' &&
        input.toString().substring(0, 5) === 'class';
  };

  client.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  String.prototype.toHex = function() {
    var hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
      hash = this.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    var color = '#';
    for (let i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 255;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
};