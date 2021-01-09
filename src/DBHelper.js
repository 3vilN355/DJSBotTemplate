/* eslint-disable no-unused-vars */
const Permission = require('./models/Permission');
const Settings = require('./models/Settings');
const Wildcard = require('./models/Wildcard');
class DatabaseHelper {
  constructor(client){
    this.client = client;
  }

  updateMember(memberID){

  }

  insertWildcard(obj){
    this.client.log('Insert', `Adding wildcard for ${obj.guild}`);
    return new Promise((resolve, reject) => {
      new Wildcard(obj).save().then(async wildcard => {
        this.client.log('Fetch', `Added wildcard for ${obj.guild}`);
        let newSettings = await Settings.findOneAndUpdate({_id:obj.guild}, {$push:{wildcards:wildcard._id}}, {new:true})
          .populate({
            path: 'wildcards',
            populate: { path: 'permission'}
          }).lean();
        this.client.settings.set(obj.guild, newSettings);
        resolve(wildcard);
      }).catch(e => {
        reject(e);
      });
    });
  }

  insertPermission(obj){
    return new Promise((resolve, reject) => {
      new Permission(obj).save().then(async permission => {
        resolve(permission._id);
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
        let newSettings = await Settings.findOneAndUpdate({_id:obj.guild}, {$pull:{wildcards:obj._id}}, {new:true})
          .populate({
            path: 'wildcards',
            populate: { path: 'permission'}
          }).lean();
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
        .populate({
          path: 'wildcards',
          populate: { path: 'permission'}
        })
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

  async getInitialData(){
    return await Settings.findOneAndUpdate({_id: 'default'}, {}, {upsert:true, setDefaultsOnInsert:true, new:true}).lean();
  }
}

module.exports = DatabaseHelper;