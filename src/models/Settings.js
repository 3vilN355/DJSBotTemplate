const {
  Schema,
  model,
} = require('mongoose');

const settingsSchema = Schema({
  _id: String,
  prefix: { type: String, default: '!' },
});

module.exports = model('Settings', settingsSchema);
