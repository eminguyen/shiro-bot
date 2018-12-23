

module.exports = {

  // A list of available commands
  commands: [
    'help',

  ],

  /**
   *
   */
  'help': {
    usage: '~help',
    description: 'Always at your service nii-chan!',
    method: (client, message, args) => {
      message.channel.send('help');
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

  /**
   * @
   */
   'uwu': {

   }

   /**
    *
    */


}
