require('dotenv').config();
const dev = process.env.dev == '1';
const Client = require('./src/Client.js');
const client = new Client(dev?{dev:true}:null);

String.prototype.toHex = function() {
  var hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var color = '#';
  for (let i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

client.login(process.env.token);