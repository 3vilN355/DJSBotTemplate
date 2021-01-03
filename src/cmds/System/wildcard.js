/* eslint-disable no-inner-declarations */
let Command = require('../../classes/Command');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      aliases: ['wc'],
      description: 'Manages wildcards for the server',
      usages: ['list', 'create <wildcard> <replacementString>', 'delete <wildcard>', 'edit <wildcard>'],
      deleteFlagsFromArgs: false,
      emitError: true,
    });
  }
  async run(message, permCalc, args){
    // Lets identify the mandatory args
    if(!args[0]) return this.error(1, message.settings.prefix);
    if(args[0].toLowerCase() == 'delete'){
      if(!args[1]) return this.error(1, message.settings.prefix);
      let WCToDelete = args[1];
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
      while(replace.split(/ +/g).find(arg => /%%/.test(arg))){
        replace = replace.replace('%%',`$${i}`);
        i++;
      }
      let wcObj = {
        guild: message.guild.id,
        wildcard: init,
        argumentsToInclude: i-1,
        replaceRegex: replace
      };
      await this.client.dbHelper.insertWildcard(wcObj);
  
      return {description: `Added wildcard \`${init}\``};
    }
  }
};
