// import tgsnake package
import { Snake, shutdown } from 'tgsnake';
// save your credentials with tgsnake.config.js
const client = new Snake();
// example start command
client.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
// running the client instance
client.run();
