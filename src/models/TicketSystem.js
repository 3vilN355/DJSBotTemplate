const {Schema, model}= require('mongoose');

const ticketSystemSchema = Schema({
  messageID: {type: String, index:true},
  guildID: {type: String},
  roles: {type: Array},
  initialMessage: Object,
  parentID: {type: String},
}, {timestamps:true});

module.exports = model('ticketSystem', ticketSystemSchema);