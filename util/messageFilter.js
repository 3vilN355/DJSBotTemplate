module.exports = class{
  constructor(client, message) {
    this.client = client;
    this.message = message;
  }

  get shouldDelete(){
    return false;
  }
  get shouldStop(){
    return false;
  }
  
};