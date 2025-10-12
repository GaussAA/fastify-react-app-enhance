import { app } from './app.js';
const port = Number(process.env.PORT || 8001);
app.listen({ port }).then(() => {
  app.log.info('Server listening on ' + port);
});
