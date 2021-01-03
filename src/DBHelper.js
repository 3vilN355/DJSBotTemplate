/* eslint-disable no-unused-vars */
const Settings = require('./models/Settings');
const Wildcard = require('./models/Wildcard');
class DatabaseHelper {
  constructor(client){
    this.client = client;
  }

  insertWildcard(obj){
    this.client.log('Insert', `Adding wildcard for ${obj.guild}`);
    return new Promise((resolve, reject) => {
      new Wildcard(obj).save().then(async wildcard => {
        this.client.log('Fetch', `Added wildcard for ${obj.guild}`);
        let newSettings = await Settings.findOneAndUpdate({_id:obj.guild}, {$push:{wildcards:wildcard._id}}, {new:true}).populate('wildcards').lean();
        this.client.settings.set(obj.guild, newSettings);
        resolve(wildcard);
      }).catch(e => {
        reject(e);
      });
    });
  }
  deleteWildcard(obj){
    this.client.log('Delete', `Deleting wildcard for ${obj.guild}`);
    return new Promise((resolve, reject) => {
      Wildcard.deleteOne(obj).then(async response => {
        this.client.log('Delete', `Deleted wildcard for ${obj.guild}`);
        let newSettings = await Settings.findOneAndUpdate({_id:obj.guild}, {$pull:{wildcards:obj._id}}, {new:true}).populate('wildcards').lean();
        this.client.settings.set(obj.guild, newSettings);
        resolve(response);
      }).catch(e => {
        reject(e);
      });
    });
  }

  getServerSettings(guildID){
    this.client.log('Load', `Loading server settings for ${guildID}`);
    return new Promise((resolve, reject) => {
      Settings.findOne({_id: guildID})
        .populate('wildcards')
        .lean().exec().then(settings => {
          if(!settings) throw new Error();
          this.client.log('Load', `Loaded server settings for ${guildID}`);
          resolve(settings);        
        }).catch(e => {
          this.client.log('Load', `Server settings for ${guildID} non-existant, generating`);
          new Settings({_id:guildID}).save().then(settings => {
            this.client.log('Fetch', `Finished generating config for guild with ID:${guildID}`);
            resolve(settings);
          }).catch(e => {
            reject(e);
          });
        });
    });
  }

  getInitialData(){
    return new Promise((resolve, reject) => {
      let data = {};
      Promise.all([
        Settings.findOne({_id: 'default'}).lean().exec()
      ]).then(all => {
        data.settings = all[0];
        resolve(data);
      }).catch(err => {
        console.error(err);
        reject(err);
      });
    });
  }
}

module.exports = DatabaseHelper;