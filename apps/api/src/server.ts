import { app } from './app.js';
import { port, host } from './config/env.js';

app.listen({ port, host }).then(() => {
  app.log.info(`Server listening on http://${host}:${port}`);
});
