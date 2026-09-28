import { createApp } from './app.js';
import { SessionStore } from './session-store.js';

export { createApp, SessionStore };

const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

if (process.env['NODE_ENV'] !== 'test') {
  const app = createApp();
  app.listen(port, () => {
    console.log('[ai-pet-game-runtime] MVP Runtime listening on port ' + port);
  });
}