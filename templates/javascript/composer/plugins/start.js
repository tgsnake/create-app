const { Composer } = require('tgsnake');
const start = new Composer();
start.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
module.exports = { start };
