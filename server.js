/**
 * @file Manages the entire backend for Shiro
 * @author Emily Nguyen
 */

// Import modules
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

// Retrieve bot settings
const token = process.env.API_KEY || config.token;
const prefix = config.prefix;

// Declare a client object
const client = new Discord.Client();
client.login(token);

// Load commands into a commands map
client.commands = new Discord.Collection();
client.helpList = [];
const modulesList = fs.readdirSync('./modules');
for(const file of modulesList) {
  const module = require(`./modules/${file}`);
  let commandsList = [];
  for(let i = 0; i < module.commands.length; i++) {
    let command = module.commands[i];

    // Check for aliases
    if(module[command].aliases) {
      for(let alias of module[command].aliases) {
        client.commands.set(alias, module[command]);
      }
    }
    commandsList.push([command, module[command].usage]);
    client.commands.set(command, module[command]);
  }
  client.helpList.push([file, commandsList, module.description, module.thumbnail]);
}

// When the client is ready, set its activity and announce that we've logged in
client.on('ready', () => {
  console.log(`Logging in as ${client.user.tag}!`);
  client.user.setActivity(config.activity);
});

// When the client receives a message, match the message with a command
client.on('message', (message) => {
  commandCheck(message);
});

/**
 * @function commandCheck
 * @desc Checks if command is called and executes it
 * @arg message The message sent to the user
 */
let commandCheck = (message) => {
  if(!message.author.bot) {
    let com, args;
    let msg = message.content;

    // Checks if the message starts with the prefix and if so, isolate command and arguments
    if(msg.startsWith(prefix)) {
      com = msg.split(" ")[0].substring(prefix.length);
      args = msg.split(" ").slice(1);
    }

    // Checks if bot is mentioned and if so, isolate command and arguments
    else if(message.isMentioned(client.user)) {
      com = msg.split(" ")[1];
      args = msg.split(" ").slice(2);
      if(!com) {
        message.channel.send("Yes Nii-chan?");
        return;
      }
    }

    // Help command
    if(com == 'help') {
      args = Discord;
    }

    // If the command exists, find it in the collection and run it
    if(com) {
      let command = client.commands.get(com);
      if(command) {
        command.method(client, message, args);
      }
    }
  }
}
