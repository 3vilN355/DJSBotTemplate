/* eslint-disable no-unused-vars */
const Settings = require('./models/Settings');
class DatabaseHelper {
  constructor(client){
    this.client = client;
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