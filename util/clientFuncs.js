require('colors');
const moment = require('moment');
module.exports = client => {
  client.developers = ['136985027413147648'];
  if(client.dev){
    // Assign developer IDs
  }
  client.log = (type, msg, title) => {
    if (!title) title = 'Log';
    else title = title.magenta.bold;
    if (!type) type = 'Null';
    if (['err', 'error'].includes(type.toLowerCase())) type = type.bgRed.white.bold;
  
    console.log(`[${moment().format('D/M/Y HH:mm:ss.SSS').bold.blue}] [${type.green}] [${title.yellow}] ${msg}`);
  };
  client.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };
};