// import tgsnake package
const { Snake, shutdown } = require('tgsnake');
// save your credentials with tgsnake.config.js
const client = new Snake();
// example start command
client.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
// running the client instance
client.run();
shutdown(client);
