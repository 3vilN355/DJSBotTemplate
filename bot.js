require('dotenv').config();
let clientOpts = {
  partials: ['MESSAGE', 'REACTION']
};
if(process.env.dev == '1') clientOpts.dev = true;
const Client = require('./src/Client.js');
const client = new Client(clientOpts);

client.login(process.env.token);