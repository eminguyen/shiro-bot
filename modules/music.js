/**
 * @file Module for music commands
 * @author Emily Nguyen
 */

const YTDL = require('ytdl-core');

module.exports = {

  // A list of available commands
  commands: [
    'join',
    'play'
  ],

  // A description of this module
  description: 'I can sing for you!',

  // An image representing this module
  thumbnail: 'https://i.ytimg.com/vi/rnV6A0ywuG8/hqdefault.jpg',

  /**
   * @name join
   * @desc Joins a voice channel with the user
   */
  'join': {
    usage: '~join',
    description: 'Let me join your voice channel!',
    method: (client, message, args) => {
      joinChannel(message);
    }
  },

  /**
   * @name play
   * @desc Plays a song for you
   */
  'play': {
    usage: '~play [song name]',
    description: 'I sing for you!',
    method: (client, message, args) => {
      if (args.length == 0) {
        message.channel.send('Give me a song name.');
        return;
      }
      if(!servers[message.guild.id]) {
        servers[message.guild.id] = {queue: []}
      }
      let server = servers[message.guild.id];
      server.queue.push(args[0]);
      joinChannel(message, server, true);
    }
  }

}

/**
 * @function join
 * @desc Gets the bot the join the current channel
 * @arg message The message triggering to join the channel
 * @arg play Boolean to decide whether or not to play music
 * @return Returns a boolean indicating whether user is in a voice channel
 */
let joinChannel = (message, server, play) => {
  // Check if the message came from some one in a voice channel
  if(message.member.voiceChannel) {
    if(play && !server.dispatcher) {
      message.member.voiceChannel.join()
        .then((connection) => {
          playSong(connection, message);
        });
    }
    else {
      message.member.voiceChannel.join();
      message.reply('I followed you');
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
   server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: 'audioonly'}));
   server.queue.shift();
   server.dispatcher.on('end', () => {
     if(server.queue[0]) {
       playSong(connection, message);
     }
     else {
       connection.disconnect();
     }
   })
 }
