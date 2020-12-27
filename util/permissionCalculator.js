module.exports = class {
  constructor(client, settings, member){
    this.client = client;
    if(client.developers.includes(member.id)) this.allowAll = true;
    this.settings = settings;
    this.member = member;
  }

  get wildcards(){
    return this.allowAll || this.__wildcard;
  }
};