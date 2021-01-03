const {
  Schema,
  model,
} = require('mongoose');

const permissionSchema = Schema({
  // Developers are always allowed regardless
  contextAllowed: { type: String, default: 'both'}, // This is 'guild','DM','both' or 'none' ('none' means disabled)
  permLevel: { type: Number, default: 0 }, // These correspond with the custom permlevel calculators per server. 0 is everyone
  allowedArr: [{ type: Object }] // This is for if there's a specific channel, user, context or both which change the default behaviour
});

module.exports = model('Permission', permissionSchema);
