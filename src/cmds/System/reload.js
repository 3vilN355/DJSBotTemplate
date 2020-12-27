exports.run = async (client, message, args) => {// eslint-disable-line no-unused-vars
  if (!args || !args[0]) return {error: 1};
  if (/\./.test(args[0])) {
    // There's a dot. This is a big reload
    let split = args[0].split('.');
    if(split[0] == 'events'){
      // Reload an event
      let allowedEvents = ['message'];
      if(allowedEvents.includes(split[1])){
        delete require.cache[require.resolve(`../../events/${split[1]}`)];
        client.removeAllListeners(['message']);
        let event = require(`../../events/${split[1]}`);
        client.on('message', event.bind(null, client));
      } else {
        return {error:'`No such event listener'};
      }
      return {description: `${split[1]} listener reloaded`};
    }
    if (args[0].toLowerCase() == 'util.functions') {
      delete require.cache[require.resolve(`${process.cwd()}/util/functions.js`)];
      require('../../../util/functions')(client);
      return {description: 'Functions reloaded'};
    }
  } else {
    const {err, res} = await client.unloadCommand(args[0]);
    if (err) return {error: 'Error while unloading command', description: `Error given is: ${err}`};


    const bdy = client.loadCommand(res[0], res[1]);
    if (bdy.err) return {error: 'Error Loading', description: `${bdy.err}`};

    return {description: `The command \`${res[1]}\` has been reloaded`};
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Owner',
};

exports.help = {
  name: 'reload',
  description: 'Reloads a command that"s been modified.',
  usage: 'reload <command>',
};
