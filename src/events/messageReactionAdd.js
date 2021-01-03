const Ticket = require('../models/Ticket');
const TicketSystem = require('../models/TicketSystem');
module.exports = async (client, reaction, user) => {
  if(user.bot) return;
  if(reaction.partial){
    reaction = await reaction.fetch();
  }
  if(reaction.emoji.name === '🎫') {
    // It's a ticket emoji
    const ticketSys = await TicketSystem.findOne({messageID: reaction.message.id}).lean();
    if(ticketSys){
      const findTicket = await Ticket.findOne({userID:user.id, isActive:true}).lean();
      if(findTicket) return user.send({embed: {description:`You already have an active ticket [here](https://discord.com/channels/${findTicket.guildID}/${findTicket.channelID})`, color:'RED'}});
      client.log('Create', 'Creating a ticket!');
      const permissions = ticketSys.roles.map(id => ({allow: 'VIEW_CHANNEL', id}));
      const channel = await reaction.message.guild.channels.create('ticket', {
        parent: ticketSys.parentID,
        permissionOverwrites:[
          {deny: 'VIEW_CHANNEL', id:reaction.message.guild.id},
          {allow: 'VIEW_CHANNEL', id:user.id},
          ...permissions
        ]
      });

      const msg = await channel.send(`New ticket opened by ${user}!`, {embed: {color: 'GREEN', description:'React with 🔒 to close the ticket\nReact with <:tickYes:703915536492396544> to claim the ticket'}});
      await msg.react('🔒');
      await msg.react('703915536492396544');
      let ticketID = await client.getNext('Ticket');
      await (new Ticket({
        ticketID,
        channelID: channel.id,
        userID: user.id,
        guildID: reaction.message.guild.id,
        reactionMessageID: msg.id
      }).save());

      await channel.edit({name:`Ticket-${String(ticketID).padStart(5, 0)}`});
      await reaction.users.remove(user.id);
    }
  } else if(reaction.emoji.name == '🔒'){
    const ticket = await Ticket.findOne({reactionMessageID: reaction.message.id, isActive: true});
    if(ticket){
      // We don't allow the user themselves to claim the ticket
      if(ticket.userID !== user.id){
        let msg = await reaction.message.channel.send(`${user} has just locked the ticket!\nClick the <:tickNo:703915536756506665> to delete the ticket!`);
        await reaction.message.channel.updateOverwrite(user.id, {VIEW_CHANNEL: false});
        ticket.lockedBy = [...ticket.lockedBy, user.id];
        ticket.isActive = false;
        ticket.deleteMessageID = msg.id;
        await msg.react('703915536756506665');
        await ticket.save();
      }
    }
  } else if (reaction.emoji.id == '703915536492396544'){ // tickYes, claim
    const ticket = await Ticket.findOne({reactionMessageID: reaction.message.id, isActive: true, isClaimed: false});
    if(ticket){
      // We don't allow the user themselves to claim the ticket
      if(ticket.userID !== user.id){
        await reaction.message.channel.send(`${user} has just claimed the ticket!`);
        await reaction.message.channel.edit({name: `Claimed-${String(ticket.ticketID).padStart(5, 0)}`});
        ticket.claimedBy = [...ticket.claimedBy, user.id];
        ticket.isClaimed = true;
        await ticket.save();
      }
    }
  } else if (reaction.emoji.id == '703915536756506665'){ // tickNo, delete
    const ticket = await Ticket.findOne({deleteMessageID: reaction.message.id});
    if(ticket){
      await reaction.message.channel.delete();
      ticket.deletedBy = user.id;
      await ticket.save();
    }
  }
};