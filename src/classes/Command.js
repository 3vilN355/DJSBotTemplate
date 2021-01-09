module.exports = class {
  constructor(client, module, name,  options) {
    this.client = client;
    this.module = module || 'Unknown';
    this.name = options.name || name;
    this.aliases = options.aliases || [];
    this.permLevel = options.permLevel || 15;
    this.allowedIn = options.allowedIn || 0b10; // Bitwise. 10 is guild, 01 is dm, 11 is both obviously
    this.description = options.description || 'No description given';
    this.emitError = options.emitError || false;
    this.flags = options.flags || [];
    this.deleteFlagsFromArgs = options.deleteFlagsFromArgs || true;
    this.mutex = options.mutex || [];
    this.usages = options.usages;
    this.usage = options.usage || '';
    this.enabled = options.enabled || false;
    this.disableMessage = options.disableMessage || false;
  }
  
  // eslint-disable-next-line no-unused-vars
  async run(message, permCalc, args) {
    throw new Error(`Command ${this.name} doesn't provide a run method!`);
  }

  async getType(arg){
    if(await this.getChannelID(arg)) return 'ChannelID';
    else if(await this.getGuildID(arg)) return 'GuildID';
    else if(await this.getUserID(arg)) return 'UserID';
    return;
  }

  async identifyArgs(args, guild){
    let out = [];
    for(let arg of args) {
      out.push(await this.identifyArg(arg, guild));
    }
    return out;
  }

  async identifyArg(arg, guild){
    let id;

    id = await this.getChannelID(arg, guild);
    if(id) return {type: 'ChannelID', id};

    id = await this.getGuildID(arg);
    if(id) return {type: 'GuildID', id};

    id = await this.getUserID(arg);
    if(id) return {type: 'UserID', id};

    if(guild) {
      id = await this.getRoleID(arg, guild);
      if(id) return {type: 'RoleID', id};
    }
    
    return;
  }

  async getChannelID(arg = '', guild){
    let ID = arg.match(/\d{17,19}/);
    if(ID){
      if((guild?guild:this.client).channels.cache.has(ID[0])) return ID[0];
    }
    return false;
  }

  async getGuildID(arg = ''){
    let ID = arg.match(/\d{17,19}/);
    if(ID){
      if(this.client.guilds.cache.has(ID[0])) return ID[0];
    }
    return false;
  }

  async getUserID(arg = ''){
    let ID = arg.match(/\d{17,19}/);
    if(ID){
      let user = await this.client.users.fetch(ID[0]).catch(() => {});
      if(user) return user.id;
    }
    return false;
  }
  
  async getRoleID(arg = '', guild){
    if(!guild) return false;
    let ID = arg.match(/\d{17,19}/);
    if(ID){
      let role = await guild.roles.fetch(ID[0]).catch(() => {});
      if(role) return role.id;
    }
    return false;
  }

  usageToString(prefix){
    if(this.usages){
      return this.usages.map(u => `\`${prefix}${this.name} ${u}\``).join('\n');
    } else return `${prefix}${this.name} ${this.usage}`.trim();
  }

  async error(errNum = 0, description = '', title = 'An error occured'){
    if(errNum == 0){
      return {color: 'RED', title, description};
    } else if(errNum == 1){
      return {color: 'RED', title: 'Not enough arguments!', description: `Command usage:\n${this.usageToString(description)}`};
    } else if(errNum == 2){
      let e = {color: 'RED', title: 'Invalid argument!', description: `Command usage:\n${this.usageToString(description)}`}
      if(title != 'An error occured') e.description += `\n\n${title}`;
      return e;
    }
  }
};