// import tgsnake package
import { Snake } from 'tgsnake';
// save your credentials with tgsnake.condig.js
const client = new Snake();
// example start command
client.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
// running the client instance
client.run();
