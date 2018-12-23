module.exports = {

  // A list of available commands
  commands: [
    '8ball',
    'rps',
    'uwu'
  ],

  /**
   *
   */
  '8ball': {
    usage: '',
    description: 'I can read the future',

  },

  'diceroll': {

  },

  /**
   *
   */
  'rps': {
    usage: '~rps [rock, paper, or scissors]',
    description: 'Play Rock Paper Scissors!',
    method: (client, message, args) => {
      if(args.length == 0) {
        message.channel.send('Pick something!');
        return;
      }
      switch(args[0].toLowerCase()) {
        case 'rock':
          message.channel.send('Paper. Blank wins again!');
          return;
        case 'paper':
          message.channel.send('Scissors. Blank wins again!');
          return;
        case 'scissors':
          message.channel.send('Rock. Blank wins again!');
          return;
        default:
          message.channel.send("The options are Rock, Paper, and Scissors. Don't cheat against Blank!");
      }
      return;
    }
  },

  /**
   *
   */
  'uwu': {
    usage: '~uwu or ~owo',
    description: 'uwu',
    aliases: ['owo'],
    method: (client, message, args) => {
      let options = ['UwU', 'uwu', '☆w☆', '✧w✧', '♥w♥', 'owo', '⓪w⓪', 'OwO', '@w@','◔w◔'];
      message.channel.send(options[Math.floor(Math.random()*options.length)]);
    }
  },


}
