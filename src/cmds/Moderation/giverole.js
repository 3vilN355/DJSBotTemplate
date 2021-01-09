let Command = require('../../classes/Command');

// const helpUI = 1;
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Gives a role to a user!',
      usage: '<@role | roleID> <@user | userID>',
      emitError: true,
      flags: [
        {
          flag: 'notify',
          untilNextFlag: true
        },
        {
          flag: 'd',
        }
      ],
      permLevel: 4,
    });
  }
  // eslint-disable-next-line no-unused-vars
  async run(message, permCalc, args){
    // Identify first arg as role id
    if(!args[1]) return this.error(1, message.settings.prefix);
    // Identify the args
    let roleID = await this.identifyArg(args[0], message.guild);
    if(!roleID || roleID.type != 'RoleID') return this.error(2, message.settings.prefix);
    let userID = await this.identifyArg(args[1], message.guild);
    if(!userID || userID.type != 'UserID') return this.error(2, message.settings.prefix);

    
    let sPermLevel = 0;
    for(let permLevel of message.settings.permissionLevels.sort((a, b) => a.permLevel-b.permLevel)){
      if(sPermLevel) break;
      if(permLevel.roles.includes(roleID.id)) sPermLevel = permLevel.permissionLevel;
    }

    if(sPermLevel >= permCalc.permLevel) return this.error(0, 'You can\'t give away a staff role with more permissions than your own!');
    // Just give the user the role
    let member = await message.guild.members.fetch(userID.id);
    await member.roles.add(roleID.id).catch(() => {});

    if(message.flags?.notify) {
      let role = await message.guild.roles.cache.get(roleID.id);
      let embed = {description:`You've just been given the role\n${role.name}\nin ${message.guild.name}!`, color:'GREEN'};
      if(message.flags.notify[0]) {
        embed.description += '\nThey\'ve attached the following note:';
        embed.footer = {text: message.flags.notify.join(' ')};
      }
      await member.user.send({embed}).catch(() => {});
    }

    if(message.flags?.d){
      await message.delete().catch(() => {});
    }

    return {color:'GREEN', description:`Successfully gave <@${userID.id}> the <@&${roleID.id}> role!`};
  }
};