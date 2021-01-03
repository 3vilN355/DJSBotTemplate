let Command = require('../../classes/Command');
let Trello = require('trello');
let trello = new Trello(process.env.trello_key, process.env.trello_token);
const boardID = '5fe8bde835e7623d977bf530';
const planListID = '5ff102b2ce18bf7a71c378ee';
const todoListID = '5fe8bdec35f2f002027d2fcb';

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      enabled: true,
      description: 'Trello stuff',
      // emitError: true,
      aliases: ['t'],
      flags: [
        {
          flag:'urgent'
        },
        {
          flag:'low'
        },
        {
          flag:'medium'
        },
        {
          flag:'high'
        },
      ],
      mutex:[
        {flags: ['urgent','low','medium','high']}
      ]
    });
  }
  async run(message, permCalc, args){
    if(!args[0]) return this.error(1, message.settings.prefix);
    if(args[0] == 'plan') {
      let [name, desc] = args.slice(1).join(' ').split(/\|/);
      let res = await trello.addCard(name, desc, planListID);
      if(!res) return;
      return {description: `Added card to **Planned** list [here](${res.url})`};
    } else if(args[0] == 'todo') {
      let [name, desc] = args.slice(1).join(' ').split(/\|/);
      let res = await trello.addCard(name, desc, todoListID);
      if(message.flags) {
        // Add a label to it probably
        // Get priority custom field
        let temp = await trello.getCustomFieldsOnBoard(boardID);
        // Lets find the Priorty List one
        let obj = temp.find(obj => obj.name == 'Priority' && obj.type == 'list');
        if(!obj) return this.error(0, `There is no Priority Custom Field on this board!\nPlease run \`${message.settings.prefix}trello setup\``);

        let valueID;
        if(message.flags.urgent) valueID = obj.options.find(opt => opt.color == 'red').id;
        else if(message.flags.low) valueID = obj.options.find(opt => opt.color == 'green').id;
        else if(message.flags.medium) valueID = obj.options.find(opt => opt.color == 'yellow').id;
        else if(message.flags.high) valueID = obj.options.find(opt => opt.color == 'orange').id;
        await trello.updateCustomListFieldOnCard(res.id, obj.id, valueID);
      }
      if(!res) return;
      return {description: `Added card to **Todo** list [here](${res.url})`};
    } else if(args[0] == 'setup') {
      // Is there a priority custom field?
      let res = await trello.getCustomFieldsOnBoard(boardID);
      // Lets find the Priorty List one
      let obj = res.find(obj => obj.name == 'Priority' && obj.type == 'list');
      if(obj) {
        await trello.deleteCustomField(obj.id);
      }
      // Check if we can add custom field
      res = await trello.addPriorityField(boardID);

      // We added the custom field!
      return {description: 'Trello has successfully been set up!'};
    }
  }
};