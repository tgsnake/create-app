// import tgsnake package
const { Snake } = require('tgsnake');
// save your credentials with tgsnake.condig.js
const client = new Snake();
// example start command
client.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
// running the client instance
client.run();
