/* eslint-disable no-inner-declarations */
let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      aliases: ['wc'],
      description: 'Manages wildcards for the server',
      usages: ['list', 'create <wildcard> <replacementString>', 'delete <wildcard>', 'edit <wildcard>'],
      flags: [
        {flag:'level',
          args:1}
      ],
      deleteFlagsFromArgs: false,
      emitError: true,
    });
  }
  async run(message, permCalc, args){
    // Lets identify the mandatory args
    if(!args[0]) return this.error(1, message.settings.prefix);
    if(args[0].toLowerCase() == 'delete'){
      if(!message.oldArgs[1]) return this.error(1, message.settings.prefix);
      let WCToDelete = message.oldArgs[1];
      // Lets find this wildcard
      let wc = (message.settings.wildcards||[]).find(wc => wc.wildcard == WCToDelete);
      if(wc){
        await this.client.dbHelper.deleteWildcard(wc);
  
        return {color: 'GREEN', description: `Successfully deleted the \`${wc.wildcard}\` wildcard`};
      } else return this.error(0, 'There was no such wildcard found');
    }
    if(message.hasWildcard) return this.error(0, 'You cannot use active wildcards in the wildcard command');
    if(args[0].toLowerCase() == 'list'){
      if((message.settings.wildcards||[]).length > 0){
        return {color: 'GREEN', description: message.settings.wildcards.map((wc) => `\`${wc.wildcard}\` takes ${wc.argumentsToInclude} args, and replaces it with ${wc.replaceRegex}`).join('\n')};
      }
    } else if (args[0].toLowerCase() == 'create') {
      // Create wildcard

      if(!args[2]) return this.error(1, message.settings.prefix);
  
      // Get initializer
      let init = args[1];
      let replace = args.slice(2, args.length);
      // Does a wildcard with this initializer exist?
      if((message.settings.wildcards||[]).find(wc => wc.wildcard == init)){
        return this.error(0, 'A wildcard with that initializer already exists!');
      }
      // Generate regex from content
      let i = 1;
      replace = replace.join(' ');
      while(/%%/.test(replace)){
        replace = replace.replace(/%%/,`$${i}`);
        i++;
      }
      let permObj = {
        permLevel: Math.min(permCalc.permLevel, 6), // What's the default perm level for wildcards?
      };
      if(message.flags){
        if(message.flags.level){
          // Parse level and set it as permlevel
          let permLevel = Number.parseInt(message.flags.level[0]);
          if(isNaN(permLevel) || permLevel < 0 || permLevel > 10) return this.error(0, 'The -level flag requires a number from 0 to 10 (like `-level 4`)');
          if(permLevel > permCalc.permLevel) return this.error(0, `You can't set a wildcard permlevel higher than your own (${permCalc.permLevel})`);
          permObj.permLevel = permLevel;
        }
      }
      let permission = await this.client.dbHelper.insertPermission(permObj);
      let wcObj = {
        guild: message.guild.id,
        wildcard: init,
        argumentsToInclude: i-1,
        replaceRegex: replace,
        permission
      };
      await this.client.dbHelper.insertWildcard(wcObj);
  
      return {description: `Added wildcard \`${init}\``};
    }
  }
};
