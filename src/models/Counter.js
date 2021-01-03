const {Schema, model}= require('mongoose');

const counterSchema = Schema({
  _id: String,
  num: {type: Number, default: 0},
});

module.exports = model('Counter', counterSchema);