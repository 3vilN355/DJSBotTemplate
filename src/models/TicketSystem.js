const {Schema, model}= require('mongoose');

const ticketSystemSchema = Schema({
  messageID: {type: String, index:true},
  guildID: {type: String},
  roles: {type: Array},
  parentID: {type: String},
}, {timestamps:true});

module.exports = model('ticketSystem', ticketSystemSchema);