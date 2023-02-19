const http = require('http');
const { createTerminus } = require('@godaddy/terminus');
const newrelic = require('./newrelic');
const app = require('./app');
const pkg = require('../package.json');
const services = require('./services');
const { log } = require('./output');
const { EXPOSED_HOST, EXPOSED_PORT } = require('./env');

const server = http.createServer(app);

const run = async () => {
  await services.start();

  createTerminus(server, {
    timeout: 1000,
    signals: ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT'],
    healthChecks: { '/_health': () => services.ping() },
    onSignal: () => {
      log('> Cleaning up...');
      return services.stop().catch((e) => log('> CLEANUP ERRORS:', e));
    },
    onShutdown: () => log('> Cleanup finished. Shutting down.'),
  });

  server.listen(80, () => log(`> Ready on http://${EXPOSED_HOST}:${EXPOSED_PORT}`));
};

// Simulate future NodeJS behavior by throwing unhandled Promise rejections.
process.on('unhandledRejection', (e) => {
  log('> Unhandled promise rejection. Throwing error...');
  newrelic.noticeError(e);
  throw e;
});

log(`> Booting ${pkg.name} v${pkg.version}...`);
run().catch((e) => setImmediate(() => {
  newrelic.noticeError(e);
  throw e;
}));
