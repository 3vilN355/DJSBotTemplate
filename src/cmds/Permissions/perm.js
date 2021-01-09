let Command = require('../../classes/Command');
const Settings = require('../../models/Settings');
const _ = require('lodash');
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Permissions editor for commands and/or staff members',
      usages: ['info <command | role>', 'list', 'set <1-9> <@role|roleID> [...@role|roleID]', 'delete <1-9>'],
      aliases: ['permission'],
      emitError: true,
      permLevel: 6,
    });
  }
  async run(message, permCalc, args){
    if(!args[0]) return this.error(1, message.settings.prefix);
    else if(args[0].toLowerCase() == 'info'){
      // Identify the second argument. Is it a command?
      if(this.client.commands.has(args[1].toLowerCase()) || this.client.aliases.has(args[1].toLowerCase())){
        // Give permission info for said command
        let cmd = this.client.commands.get(args[1].toLowerCase()) || this.client.commands.get(this.client.aliases.get(args[1].toLowerCase()));
        return {color: permCalc.permLevel>=cmd.permLevel?'GREEN':'RED', title: `Permission info for ${cmd.name} command`, description:`By default, allowed for anyone of perm level ${cmd.permLevel} or above`};
      }
    } else if(args[0].toLowerCase() == 'list'){
      // Lets list the role settings for the server
      let emb = {color: 'YELLOW', fields: Array(9), title: `Permission list for ${message.guild.name}`, description:'Below, you\'ll see the ordered list of roles\' permission levels.\n'+
    '**NOTE**: The **server owner** will always have **permission level 10**.'};
      let sorted = message.settings.permissionLevels || [];
      for(let i of _.rangeRight(9)){
        let permLevel = sorted.find(o => o.permissionLevel == i+1);
        let obj = {name: `Permission level ${i+1}`, inline:true};
        if(permLevel){
          if(permLevel.roles.length > 1){
            obj.value = `Anyone with one of the following roles:\n${permLevel.roles.map(id => `<@&${id}>`).join(', ')}`;
          } else{
            obj.value = `Anyone with the ${permLevel.roles.map(id => `<@&${id}>`)[0]} role.`;
          }
        }
        if(i+1 == 7) obj.value = obj.value?obj.value+'\nAnyone with **Administrator**': 'Anyone with **Administrator**';
        else if(i+1 == 6) obj.value = obj.value?obj.value+'\nAnyone with **Manage Server**': 'Anyone with **Manage Server**';
        if(!obj.value) obj.value = 'No roles set';
        emb.fields[i] = obj;
      }
      return emb;
    } else if(args[0].toLowerCase() == 'set'){
      if(!args[1]) return this.error(1, message.settings.prefix);

      // Lets identify which perm level they want to set
      let levelToSet = Number.parseInt(args[1]);
      if(isNaN(levelToSet) || levelToSet < 1 || levelToSet > 9) return this.error(2, message.settings.prefix);
      if(levelToSet >= permCalc.permLevel) return this.error(0, 'You can\'t set permission level at or above your own');

      // They're through, we should go through the actual arguments from here on out
      let identified = await this.identifyArgs(args.slice(2), message.guild);
      if(identified.some(arg => arg?.type != 'RoleID')) return this.error(0, 'At least one or more of the provided arguments were not a role.');

      // Lets replace the one we have if we have one
      let roles = identified.map(r => r.id);
      let found = (message.settings.permissionLevels||[]).find(obj => obj.permissionLevel == levelToSet);
      
      if(found) this.client.settings.get(message.guild.id).permissionLevels.roles = roles;
      else this.client.settings.get(message.guild.id).permissionLevels = [...(message.settings.permissionLevels||[]), {permissionLevel: levelToSet, roles}];
      // Now, set that level!
      await Settings.updateOne({_id:message.guild.id}, {permissionLevels: this.client.settings.get(message.guild.id).permissionLevels});
      return {description: `Successfully set permission level ${levelToSet}`, color:'GREEN'};
    } else if(args[0].toLowerCase() == 'delete'){
      if(!args[1]) return this.error(1, message.settings.prefix);

      // Lets identify which perm level they want to set
      let levelToSet = Number.parseInt(args[1]);
      if(isNaN(levelToSet) || levelToSet < 1 || levelToSet > 9) return this.error(2, message.settings.prefix);
      if(levelToSet >= permCalc.permLevel) return this.error(0, 'You can\'t delete permission level at or above your own');

      let found = (message.settings.permissionLevels||[]).find(obj => obj.permissionLevel == levelToSet);
      
      if(found) this.client.settings.get(message.guild.id).permissionLevels = message.settings.permissionLevels.filter(r => r.permissionLevel != levelToSet);
      else return this.error(0, `There is no roles set for permission level ${levelToSet}`);
      // Now, set that level!
      await Settings.updateOne({_id:message.guild.id}, {permissionLevels: this.client.settings.get(message.guild.id).permissionLevels});
      return {description: `Successfully deleted permission level ${levelToSet}`, color:'GREEN'};
    } else if(args[0].toLowerCase() == 'command'){
      if(!args[1]) return this.error(1, message.settings.prefix);

      // What command thing do they want to do?
      if(args[1].toLowerCase() == 'list'){
        // List the commands by permission level

      } else if(args[1].toLowerCase() == 'set'){
        // Set a command at a specific permission level

      } else if(args[1].toLowerCase() == 'reset'){
        // Reset the perm level for a specific command

      }
    }
    return this.error(2, message.settings.prefix);
  }
};