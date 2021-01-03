const {
  Schema,
  model,
} = require('mongoose');

const commandSchema = Schema({
  defaultAllowed: { type: Boolean },
  permissions: { type: Schema.Types.ObjectId, ref: 'Permission'},
  customAllowed: [{ type: Object }]
});

module.exports = model('Command', commandSchema);