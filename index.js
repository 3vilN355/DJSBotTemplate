require('dotenv').config();
// I'm going to use sharding provided by discord.js
const { ShardingManager } = require('discord.js');

// I'm probably going to add more args to each bot in the future.
const manager = new ShardingManager('./bot.js', { token: process.env.token });

// Might use this for something
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

// Go!
manager.spawn();