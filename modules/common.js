

module.exports = {

  // A list of available commands
  commands: [
    'ping',
    'stats'
  ],

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
   *
   */
  'stats': {
    usage: '~stats',
    description: 'Displays my stats',
    method: (client, message, args) => {
      message.channel.send();
    }
  },


}
