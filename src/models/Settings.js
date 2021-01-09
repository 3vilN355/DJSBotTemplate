const {
  Schema,
  model,
} = require('mongoose');

const settingsSchema = Schema({
  _id: String,
  prefix: { type: String, default: 'w.' },
  wildcards: [{ type: Schema.Types.ObjectId, ref: 'Wildcard'}],
  permissionLevels: [{permissionLevel: Number, roles: Array}],
  channels: {
    // Default channels which every guild could use
    welcome: { type: String }
  },
  modules: {
    // The cmd categories
    System: {
      enabled: { type: Boolean, default: true }
    },
    Settings: {
      enabled: { type: Boolean, default: true }
    },
  }
}, { timestamps: true });

module.exports = model('Settings', settingsSchema);
