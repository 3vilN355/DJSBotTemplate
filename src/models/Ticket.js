const {Schema, model}= require('mongoose');

const ticketSchema = Schema({
  ticketID: {type: Number},
  channelID: {type:String},
  userID: {type: String, index:true},
  guildID: {type: String},
  reactionMessageID: {type: String, index:true},
  claimedBy: Array,
  lockedBy: Array,
  deletedBy: String,
  isActive: {type:Boolean, default:true},
  isClaimed: {type:Boolean, default:false},
  deleteMessageID: String,
}, {timestamps:true});

module.exports = model('Ticket', ticketSchema);