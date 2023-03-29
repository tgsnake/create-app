import { Composer } from 'tgsnake';
export const start = new Composer();
start.cmd('start', async (ctx) => {
  return ctx.message.reply('Alive!!');
});
