const mongoose = require('mongoose');
const app = require('./app');
const { port } = require('./config/env');
const { connectMongo } = require('./db/mongo');
const { pool, initSchema } = require('./db/mysql');

async function start() {
  await connectMongo();
  await initSchema();
  console.log('MySQL ready');

  const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

  const shutdown = async () => {
    server.close();
    await Promise.allSettled([mongoose.disconnect(), pool.end()]);
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
