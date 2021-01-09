const {
  Schema,
  model,
} = require('mongoose');

const permissionSchema = Schema({
  // Developers are always allowed regardless
  contextAllowed: Number, // 0b10 = guild, 0b1 = dms
  permLevel: Number, // These correspond with the custom permlevel calculators per server. 0 is everyone
  allowedArr: [{ type: Object }] // This is for if there's a specific channel, user, context or such which change the default behaviour
});

module.exports = model('Permission', permissionSchema);
