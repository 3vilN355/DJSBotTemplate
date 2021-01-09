const {Schema, model}= require('mongoose');

const ticketSchema = Schema({
  guildID: {type:String, ref: 'Settings'},
  exp: {type: Number, default: 0},
  curr: {
    wallet: {type: Number, default: 0},
    bank: {type: Number, default: 0},
  },
  lastClaim: Date,
  lastPickPocket: Date,
  disabledEmojis: {type: Boolean, default:false},
}, {timestamps:true});

module.exports = model('Ticket', ticketSchema);