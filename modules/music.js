/**
 * @file Module for music commands
 * @author Emily Nguyen
 */

const YTDL = require('ytdl-core');
const Youtube = require('simple-youtube-api');
const youtube = new Youtube(global.config.youtube);

module.exports = {

  // A list of available commands
  commands: [
    'delete',
    'join',
    'play',
    'queue',
    'skip'
  ],

  // A description of this module
  description: 'I can sing for you!',

  // An image representing this module
  thumbnail: 'https://i.ytimg.com/vi/rnV6A0ywuG8/hqdefault.jpg',

  /**
   * @name delete
   * @desc Deletes a song from the queue
   */
  'delete': {
    usage: '~delete',
    description: 'Deletes a song from the song queue',
    method: (client, message, args) => {
      let server = servers[message.guild.id];
      if(!server || !server.queue || server.queue.length == 0) {
        message.channel.send({embed: {
          color: 3447003,
          description: '❌ Queue is empty'
        }});
        return;
      }
      let embed = viewQueue(server, client);
      embed.setDescription('Reply with a number to delete a song from the queue');
      message.channel.send(embed);
      const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
      collector.on('collect', msg => {
        if (msg.content > 0 && msg.content <= server.queue.length) {
          let index = parseInt(msg.content) - 1;
          message.channel.send(`🗑️ Deleting ${server.queue[index][0]}`);
          server.queue.splice(index, 1);
          collector.stop();
        }
        else {
          message.channel.send("❌ Can't delete that, Nii-chan");
          collector.stop();
        }
      });
    }
  },

  /**
   * @name join
   * @desc Joins a voice channel with the user
   */
  'join': {
    usage: '~join',
    description: 'Let me join your voice channel!',
    method: (client, message, args) => {
      if(joinChannel(message)) {
        message.channel.send({embed: {
          color: 3447003,
          description: `💙 I followed ${message.author.username}`
        }});
      };
    }
  },

  /**
   * @name play
   * @desc Plays a song for you using either a playlist, link, or search
   */
  'play': {
    usage: '~play [song name]',
    description: 'I sing for you!',
    method: async (client, message, args) => {
      if (args.length == 0) {
        message.channel.send('Give me a song name.');
        return;
      }
      if(!servers[message.guild.id]) {
        servers[message.guild.id] = {queue: []}
      }
      let server = servers[message.guild.id];
      let songUrl = args.join(' ');

      // If the string is a playlist, add all the songs to the queue
      if(songUrl.includes('www.youtube.com/playlist')) {
        await youtube.getPlaylist(songUrl)
          .then(playlist => {
            message.channel.send({embed: {
              color: 3447003,
              description: `🎵 Queued up songs from [${playlist.title}](${playlist.url})`
            }});
            playlist.getVideos()
              .then(videos => {
                for(video of videos) {
                  if(server.queue.length < 25) {
                    server.queue.push([video.title, video.url]);
                  }
                  else {
                    message.channel.send({embed: {
                      color: 3447003,
                      description: `❌ Song queue full, not all songs added`
                    }});
                    return;
                  }
                }
              });
          });
      }

      // If string is a Youtube link, add to the queue
      else if(songUrl.includes('www.youtube.com')) {
        await youtube.getVideo(songUrl)
          .then(video => {
            message.channel.send({embed: {
              color: 3447003,
              description: `🎵 Queueing up [${video.title}](${video.url})`
            }});
            if(server.queue.length < 25) {
              server.queue.push([video.title, video.url]);
            }
            else {
              message.channel.send({embed: {
                color: 3447003,
                description: `❌ Song queue full`
              }});
            }
          })
          .catch(console.error);
      }

      // Search Youtube for a list of songs
      else {
        await youtube.searchVideos(songUrl, 3)
          .then(async results => {
            let embed = new global.Discord.RichEmbed();
            embed.setAuthor('Shiro', client.user.avatarURL)
            .setColor(3447003)
            .setTimestamp()
            .setFooter(`Search by ${message.author.username}`)
            .setTitle(`🎵 Search Results for ${songUrl}`)
            .setDescription('React to select a song!');
            for(let i = 1; i <= results.length; i++) {
              let result = results[i - 1];
              embed.addField(`${i} | ${result.title}`, result.url);
            }
            let filter = (reaction, user) => {
                return ['1⃣', '2⃣', '3⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            await message.channel.send(embed).then(async (msg) => {
              await msg.react('1⃣');
              await msg.react('2⃣');
              await msg.react('3⃣');
              await msg.react('❌');

              await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                  const reaction = collected.first();
                  let video;

                  if (reaction.emoji.name === '1⃣') {
                    video = results[0];
                  }
                  else if (reaction.emoji.name === '2⃣') {
                    video = results[1];
                  }
                  else if (reaction.emoji.name === '3⃣') {
                    video = results[2];
                  }
                  else {
                    msg.edit({embed: {
                      color: 3447003,
                      description: `❌ No song selected!`
                    }});
                    msg.clearReactions();
                    return;
                  }
                  msg.edit({embed: {
                    color: 3447003,
                    description: `🎵 Queueing up [${video.title}](${video.url})`
                  }});
                  if(server.queue.length < 25) {
                    server.queue.push([video.title, video.url]);
                  }
                  else {
                    message.channel.send({embed: {
                      color: 3447003,
                      description: `❌ Song queue full`
                    }});
                  }
                  msg.clearReactions();
                });
            });
          });
      }
      joinChannel(message, server, true);
    }
  },

  /**
   * @name queue
   * @desc View the current queue
   */
   'queue': {
     usage: '~queue',
     description: 'View the current queue of songs',
     method: (client, message, args) => {
       let server = servers[message.guild.id];
       if(!server || !server.queue || server.queue.length == 0) {
         message.channel.send({embed: {
           color: 3447003,
           description: '❌ Queue is empty'
         }});
         return;
       }
       message.channel.send(viewQueue(server, client));
     }
   },

  /**
   * @name skip
   * @desc Skips the current song
   */
  'skip': {
    usage: '~skip',
    description: 'Skip the current song',
    method: (client, message, args) => {
      let server = servers[message.guild.id];

      if(server.dispatcher) {
        server.dispatcher.end();
      }
    }
  }

}

/**
 * @function join
 * @desc Gets the bot the join the current channel
 * @arg message The message triggering to join the channel
 * @arg server The server with the current music queue
 * @arg play Boolean to decide whether or not to play music
 * @return Returns a boolean indicating whether user is in a voice channel
 */
let joinChannel = (message, server, play) => {
  // Check if the message came from some one in a voice channel
  if(message.member.voiceChannel) {
    if(play && (!server.dispatcher || server.dispatcher.destroyed)) {
      message.member.voiceChannel.join()
        .then((connection) => {
          playSong(connection, message);
        });
    }
    else {
      message.member.voiceChannel.join();
    }
    return true;
  }
  else {
    message.reply('Please be in a voice channel!');
  }
  return false;
}

/**
 * @function playSong
 * @arg connection The voice connection to play music to
 * @arg message The original message the user requested music with
 */
let playSong = async (connection, message) => {
  let server = servers[message.guild.id];
  server.dispatcher = connection.playStream(YTDL(server.queue[0][1], {filter: 'audioonly'}));
  server.queue.shift();
  server.dispatcher.on('end', () => {
    if(server.queue[0]) {
      playSong(connection, message);
    }
    else {
      server.dispatcher.destroy();
      connection.disconnect();
    }
  });
}

/**
 * @function viewQueue
 * @arg server The server from the list of servers
 * @arg message The original message the user requested to view the queue with
 * @return An embed representing the queue
 */
let viewQueue = (server, client) => {
  let embed = new global.Discord.RichEmbed();
  embed.setAuthor('Shiro', client.user.avatarURL)
  .setColor(3447003)
  .setTimestamp()
  .setFooter('© eminguyen')
  .setTitle('🎵 Song Queue')
  for(let i = 1; i <= server.queue.length; i++) {
    let result = server.queue[i - 1];
    embed.addField(`${i} | ${result[0]}`, result[1]);
  }
  return embed;
}
