/* eslint-disable no-unused-vars */
module.exports = class {
  constructor(client, {author, settings, member}){
    this.client = client;
    this.user = author;
    if(client.developers.includes(author.id)) this.allowAll = true;
    this.settings = settings;
    if(member) this.member = member;
    this.permLevel = client.permLevel(author, member);
  }

  useWildcard(wildcard){
    if(this.allowAll) return true;
    if(!wildcard.permission) return false;
    if(!this.member) // If its not a member, we just return. Wildcards can't be used in DMs anyway
      return false;
    return this.permLevel >= wildcard.permission.permLevel;
  }

  allowsCommand(command){
    if(this.allowAll) return true;
    if(!this.member) return this.permLevel;
    let sPermLevel = 0;
    for(let permLevel of this.settings.permissionLevels.sort((a, b) => a.permLevel-b.permLevel)){
      if(sPermLevel) break;
      if(permLevel.roles.some(r => this.member.roles.cache.has(r))) sPermLevel = permLevel.permissionLevel;
    }
    return (sPermLevel > this.permLevel?sPermLevel:this.permLevel) >= command.permLevel;
  }
};