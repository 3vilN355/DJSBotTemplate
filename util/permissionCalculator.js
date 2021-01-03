/* eslint-disable no-unused-vars */
module.exports = class {
  constructor(client, settings, member){
    this.client = client;
    if(client.developers.includes(member.id)) this.allowAll = true;
    this.settings = settings;
    this.member = member;
  }

  get useWildcards(){
    return this.allowAll || this.__wildcard;
  }

  allowsCommand(commandName){
    if(this.allowAll) return true;
    return false; // Temporarily
  }
};