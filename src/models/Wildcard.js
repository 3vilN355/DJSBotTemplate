const {
  Schema,
  model,
} = require('mongoose');

const wildcardSchema = Schema({
  guild: { type: String, ref: 'Guild'}, // Obvious
  // initializer: { type: Boolean, default: false}, // Whether or not this inializes a command. We distinguish so that there aren't multiple initializer at the same time
  permissions: { type: Schema.Types.ObjectId, ref: 'Permission'}, // Permissions for this specific wildcard
  wildcard: { type: String, index: true }, // The wildcard identifier itself
  argumentsToInclude: { type: Number, default: 0 }, // How many additional arguments to include. This errors if the arguments aren't given
  replaceRegex: { type: String }, // Regex to use when replacing the args
});

module.exports = model('Wildcard', wildcardSchema);
