require('dotenv').config();
const dev = process.env.dev == '1';
const Client = require('./src/Client.js');
const client = new Client(dev?{dev:true}:null);

client.login(process.env.token);