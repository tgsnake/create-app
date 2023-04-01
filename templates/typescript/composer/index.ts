// import tgsnake package
import { Snake, Composer } from 'tgsnake';
import path from 'path';
import fs from 'fs';
// save your credentials with tgsnake.config.js
const client = new Snake();
function loadPlugin(directory: string = 'plugins') {
  const location = path.join(__dirname, directory);
  const inside = fs.readdirSync(location);
  for (const content of inside) {
    const stat = fs.statSync(path.join(location, content));
    if (stat.isDirectory()) {
      loadPlugin(path.join(directory, content));
    } else {
      if (content.endsWith('.ts') || content.endsWith('.js')) {
        const plugin = require(path.join(location, content));
        for (const [key, value] of Object.entries(plugin)) {
          if (value instanceof Composer) {
            bot.use((value as Composer).middleware());
          }
        }
      }
    }
  }
}
loadPlugin();
// running the client instance
client.run();
