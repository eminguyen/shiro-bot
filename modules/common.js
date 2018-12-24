

module.exports = {

  // A list of available commands
  commands: [
    'avatar',
    'channelname',
    'echo',
    'help',
    'invite',
    'ping',
    'stats'
  ],

  /**
   * @name avatar
   * @desc Sends a link to the user's avatar
   */
  'avatar': {
    usage: '~avatar [*user name]',
    description: "Sends a link to the user's avatar",
    method: (client, message, args) => {
      if(args[0]) {
        message.channel.send(client.users.find('username', args[0]).avatarURL);
      }
      else {
        message.channel.send(message.author.avatarURL);
      }
    }
  },

  /**
   * @name channelname
   * @desc Changes the name of the channel that the message is sent from
   */
  'channelname': {
    usage: '~channelname [name of channel]',
    description: "Set the channel's name",
    method: (client, message, args) => {
      try {
        message.channel.setName(args[0]);
        message.channel.send(`I changed its name to ${argument}!`);
      }
      catch(error) {
        message.channel.send("I failed you Nii-chan.");
      }
    }
  },

  /**
   * @name echo
   * @desc Will make the bot repeat after you
   */
  'echo': {
    usage: '~echo [message]',
    description: 'Shiro will repeat after you!',
    method: (client, message, argument) => {
      if(!args[0]) {
        message.channel.send('Did you want me to say something?');
      }
      else {
        message.channel.send(args[0]);
      }
    }
  },

  /**
   * @name help
   * @desc Returns a list of commands
   */
  'help': {
    usage: '~help',
    description: "I'm here to help, Nii-chan!",
    method: (client, message, discord) => {
      let index = 0;

      // Generates the help message
      let embed = generateHelp(client, index, discord);

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
            if(index >= client.helpList.length) index = 0;
            msg.edit(generateHelp(client, index, discord));
            reaction.remove(message.author);
          }

          // Decrement index and regenerate the help message
          else if (reaction.emoji.name === '👈') {
            index -= 1;
            if(index < 0) index = client.helpList.length - 1;
            msg.edit(generateHelp(client, index, discord));
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
            message.channel.send('I hope I helped Nii-chan!');
          }
        });
      });
    }
  },

  /**
   * @name invite
   * @desc Returns an invite link for the bot
   */
  'invite': {
    usage: 'invite',
    description: 'Creates an invite link for the bot',
    method: (client, message, argument) => {
      message.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot`)
    }
  },

  /**
   * @name ping
   * @desc Returns the latency
   */
  'ping': {
    usage: '~ping',
    description: 'Pings the bot for latency',
    method: (client, message, args) => {
      let ping = new Date().getTime() - message.createdTimestamp;
      message.channel.send(`pong! | ${ping} ms`);
    }
  },

  /**
   * @name stats
   * @desc Returns the bot's statistics
   */
  'stats': {
    usage: '~stats',
    description: 'Displays my stats',
    method: (client, message, args) => {
      message.channel.send({embed: {
          color: 3447003,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: "http://imanity.moe",
          url: "http://imanity.moe",
          description: "Here are my statistics!",
          fields: [{
              name: "Total Servers",
              value: client.guilds.size
            },
            {
              name: "Total Users",
              value: client.users.size
            },
            {
              name: "Commands",
              value: client.commands.size
            }
          ],
          timestamp: new Date(),
          footer: {
            text: "© eminguyen"
          }
        }
      });
    }
  },


}

/**
 * @function generateHelp
 * @desc Generates a help message from an index in the helpList array
 * @arg index The index in the helpList array
 * @return RichEmbed with info on commands
 */
let generateHelp = (client, index, discord) => {
  let embed = new discord.RichEmbed();
  embed.setAuthor('Shiro', client.user.avatarURL)
  .setColor(3447003)
  .setTimestamp()
  .setFooter('© eminguyen');

  let moduleName = client.helpList[index][0];
  let commandsList = client.helpList[index][1];
  let description = client.helpList[index][2];
  let thumbnail = client.helpList[index][3];
  let title = moduleName.substr(0, moduleName.length-3);
  embed.setTitle(`${title.charAt(0).toUpperCase() + title.substr(1)} Commands`);
  for(command of commandsList) {
    embed.addField(command[0], command[1], true);
  }
  if(description) {
    embed.setDescription(description);
  }
  if(thumbnail) {
    embed.setThumbnail(thumbnail);
  }
  return embed;
}
