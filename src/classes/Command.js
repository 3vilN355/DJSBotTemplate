module.exports = class {
  constructor(client, module, name,  options) {
    this.client = client;
    this.module = module || 'Unknown';
    this.name = options.name || name;
    this.aliases = options.aliases || [];
    this.permLevel = options.permLevel || 'Bot Owner';
    this.allowedIn = options.allowedIn || 'Guild';
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

  async identifyArgs(...args){
    let out = [];
    for(let arg of args) {
      out.push(await this.identifyArg(arg));
    }
    return out;
  }

  async identifyArg(arg){
    let id;

    id = await this.getChannelID(arg);
    if(id) return {type: 'ChannelID', id};

    id = await this.getGuildID(arg);
    if(id) return {type: 'GuildID', id};

    id = await this.getUserID(arg);
    if(id) return {type: 'UserID', id};
    
    return;
  }

  async getChannelID(arg = ''){
    let ID = arg.match(/\d{17,19}/);
    if(ID){
      if(this.client.channels.cache.has(ID[0])) return ID[0];
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

  usageToSting(prefix){
    if(this.usages){
      return this.usages.map(u => `\`${prefix}${this.name} ${u}\``).join('\n');
    } else return `${prefix}${this.name} ${this.usage}`.trim();
  }

  async error(errNum = 0, description = '', title = 'An error occured'){
    if(errNum == 0){
      return {color: 'RED', title, description};
    } else if(errNum == 1){
      return {color: 'RED', title: 'Not enough arguments!', description: `Command usage:\n${this.usageToSting(description)}`};
    }
  }
};