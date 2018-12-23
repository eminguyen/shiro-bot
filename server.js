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
helpList = [];
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
  helpList.push([file, commandsList]);
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
    // Put in try catch block because if bot could be mentioned without command
    else if(message.isMentioned(client.user)) {
      try {
        com = msg.split(" ")[1];
        args = msg.split(" ").slice(2);
      }
      catch(error) {
        message.channel.send("Yes Nii-chan?");
      }
    }

    // Help command
    if(com == 'help') {
      let index = 0;

      // Generates the help message
      let embed = generateHelp(index);

      const filter = (reaction, user) => {
         return ['👈', '👉', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
      };

      // Sends the help message to the channel
      message.channel.send(embed).then(async (msg) => {
        await msg.react('👈');
        await msg.react('👉');
        await msg.react('❌');

        // Create a collector to collect reactions for one minute
        const collector = msg.createReactionCollector(filter, { time: 60000 });
        collector.on('collect', reaction => {

          // Increment index and regenerate the help message
          if (reaction.emoji.name === '👉') {
            index += 1;
            if(index >= helpList.length) index = 0;
            msg.edit(generateHelp(index));
            reaction.remove(message.author);
          }

          // Decrement index and regenerate the help message
          else if (reaction.emoji.name === '👈') {
            index -= 1;
            if(index < 0) index = helpList.length - 1;
            msg.edit(generateHelp(index));
            reaction.remove(message.author);
          }

          // End collecting reactions early
          else if (reaction.emoji.name === '❌') {
            collector.stop();
          }
        });
        collector.on('end', reaction => {
          if(msg) {
            msg.delete();
            message.channel.send('I hope I helped nii-chan!');
          }
        });
      });
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

/**
 * @function generateHelp
 * @desc Generates a help message from an index in the helpList array
 * @arg index The index in the helpList array
 * @return RichEmbed with info on commands
 */
let generateHelp = (index) => {
  let embed = new Discord.RichEmbed();
  embed.setAuthor('Shiro', client.user.avatarURL);

  let moduleName = helpList[index][0];
  let commandsList = helpList[index][1];

  embed.setTitle(moduleName.substr(0, moduleName.length-3));
  for(command of commandsList) {
    embed.addField(command[0], command[1], true);
  }
  return embed;
}
