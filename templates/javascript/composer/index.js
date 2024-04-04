// import tgsnake package
const { Snake, Composer, shutdown } = require('tgsnake');
const path = require('path');
const fs = require('fs');
// save your credentials with tgsnake.config.js
const client = new Snake();
function loadPlugin(directory = 'plugins') {
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
            bot.use(value.middleware());
          }
        }
      }
    }
  }
}
loadPlugin();
// running the client instance
client.run();
