require('dotenv').config();
const Discord = require('discord.js');
const CommandManager = require('../util/CommandManager.js');
const DatabaseHelper = require('./DBHelper.js');
const fs = require('fs');
const klaw = require('klaw');
const path = require('path');

const mongoose = require('mongoose');
mongoose.connect(process.env.mongodb_connection_string, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

class Client extends Discord.Client {
  constructor(options = {}){
    super(options);
    if(options.dev) this.dev = true;
    this.settings = new Discord.Collection();
    this.commands = new Discord.Collection();
    this.aliases = new Discord.Collection();

    this.db = mongoose.connection;        
    this.dbHelper = new DatabaseHelper(this);
    this.commandManager = new CommandManager(this);
    require('../util/clientFuncs')(this);

    this.events();
  }

  events(){
    this.db.on('error', err => console.error(err));
    this.db.once('open', async () => {
      this.log('Connected', 'Database connection established');
      // Do all initial grabbing of data from the database
      let data = await this.dbHelper.getInitialData();
      this.initialize(data);
    });

    const evtFiles = fs.readdirSync('./src/events');
    this.log('Load', `Loading a total of ${evtFiles.length} events`);
    klaw('./src/events').on('data', (item) => {
      const evtFile = path.parse(item.path);
      if (!evtFile.ext || evtFile.ext !== '.js') return;
      const event = require(`./events/${evtFile.name}${evtFile.ext}`);
      this.on(evtFile.name, event.bind(null, this));
    });

    klaw('./src/cmds')
      .on('data', (item) => {
        try {
          const file = path.parse(item.path);
          if (!file.ext || file.ext !== '.js') return;
          // Get the module
          let module = file.dir.split('\\');
          module = module[module.length-1];
          this.loadCommand(module, file.name);
        } catch (err) {
          // console.log(err);
          console.log(err.message);
        }
      });
  }

  initialize(data){
    // Initialize, use the DB data for something
    // This can't be client-reliant data, as the client isn't initialized yet.
    
    // Do we save some to client?
    if(data.settings) this.settings.set('default', data.settings);

    return data;
  }
}
module.exports = Client;
global.mongoose = mongoose;