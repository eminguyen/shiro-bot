/**
 * @file Module for fun commands
 * @author Emily Nguyen
 */

module.exports = {

  // A list of available commands
  commands: [
    '8ball',
    'coinflip',
    'diceroll',
    'rps',
    'uwu'
  ],

  /**
   * @name 8ball
   * @desc Returns a fortune!
   */
  '8ball': {
    usage: '~8ball',
    description: 'I can read the future',
    method: (client, message, args) => {
      if (args.length == 0) {
        message.channel.send('You need to ask me a question nii-chan!');
        return;
      }
      let eightball = [
        'Yes nii-chan!',
        'Yes.',
        'No baka.',
        'No.',
        'Maybe.',
      ];
      let index = (Math.floor(Math.random() * Math.floor(eightball.length)));
      message.channel.send(eightball[index]);
    }
  },

  /**
   * @name coinflip
   * @desc Flips a coin, returns heads or tails
   */
  "coinflip": {
    usage: "coinflip",
    description: "Returns heads or tails!",
    method: (client, message, args) => {
      let random = (Math.floor(Math.random() * Math.floor(2)));
      if(random === 0) {
        message.channel.send("I flipped heads!");
      }
      else {
        message.channel.send("I flipped tails!");
      }
    }
  },

  /**
   * @name diceroll
   * @desc Rolls a dice with a given number of sides (default 6 sides)
   */
  'diceroll': {
    usage: '~diceroll [*Number]',
    description: 'Helps you play more games',
    method: (client, message, args) => {

      // No number selected, default to 6
      if(args.length == 0) {
        number = 6;
      }
      else {
        number = args[0];
      }

      // Randomly selects a number in the range and returns it
      let result = (Math.floor(Math.random() * Math.floor(number)));
      if(!result) {
        message.channel.send('Is that even a number, baka?');
        return;
      }

      message.channel.send(`I rolled ${result + 1}!`);
    }
  },

  /**
   * @name rps
   * @desc Play rock paper scissors (sort of) with Shiro
   */
  'rps': {
    usage: '~rps [rock, paper, or scissors]',
    description: 'Play Rock Paper Scissors!',
    method: (client, message, args) => {

      // User didn't select an option
      if(args.length == 0) {
        message.channel.send('Pick something!');
        return;
      }

      // Plays Rock Paper Scissors (Blank always needs to win though)
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
    }
  },

  /**
   * @name uwu
   * @desc uwuwuwuwuwuwuwuwuwuwuwuwuwuwuwu
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
