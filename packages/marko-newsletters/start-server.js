require('marko/node-require');
const http = require('http');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const { isFunction: isFn } = require('@parameter1/base-cms-utils');
// const errorHandlers = require('./express/error-handlers');
const express = require('./express');
const loadTemplates = require('./utils/load-templates');

if (!process.env.LIVERELOAD_PORT) process.env.LIVERELOAD_PORT = 5010;
if (!process.env.LIVERELOAD_HOST) process.env.LIVERELOAD_HOST = 'localhost';

const { env } = process;

process.on('unhandledRejection', (e) => { throw e; });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async ({
  rootDir,
  templatePath = 'templates', // Where templates will be resolved from.
  newsletterQueryFragment, // An optional query fragment to use when loading the newsletter.
  customConfig,
  coreConfig,
  port = env.PORT || 5008,
  exposedPort = env.EXPOSED_PORT || env.PORT || 5008,
  exposedHost = env.EXPOSED_HOST || env.LIVERELOAD_HOST || 'localhost',
  graphqlUri = env.GRAPHQL_URI,
  tenantKey = env.TENANT_KEY,
  publicPath, // path to load public assets. will resolve from rootDir.
  onAsyncBlockError,

  // Terminus settings.
  timeout = 1000,
  signals = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGQUIT'],
  healthCheckPath = '/_health',
  onSignal,
  onShutdown,
  onStart,
  beforeShutdown,
  onHealthCheck,
} = {}) => {
  if (!rootDir) throw new Error('The root project directory is required.');
  if (!templatePath) throw new Error('A newsletter template location is required.');
  if (!graphqlUri) throw new Error('The GraphQL API URL is required.');
  if (!tenantKey) throw new Error('A tenant key is required.');

  // Load the newsletter package file.
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const sitePackage = require(path.resolve(rootDir, 'package.json'));

  // Load newsletter marko templates.
  const templates = await loadTemplates({
    rootDir,
    templatePath,
    queryFragment: newsletterQueryFragment,
  });

  const app = express({
    rootDir,
    templates,
    customConfig,
    coreConfig,
    graphqlUri,
    tenantKey,
    onAsyncBlockError,
    publicPath,
    sitePackage,
  });

  // Await required services here...
  if (isFn(onStart)) await onStart(app);

  // Apply error handlers.
  // errorHandlers(app, { template: errorTemplate, redirectHandler });

  const server = http.createServer(app);

  createTerminus(server, {
    timeout: env.TERMINUS_TIMEOUT || timeout,
    signals,
    // Add health checks of services here...
    healthChecks: {
      [healthCheckPath]: async () => {
        if (isFn(onHealthCheck)) return onHealthCheck();
        return { ping: 'pong' };
      },
    },
    onSignal: async () => {
      // Stop required services here...
      if (isFn(onSignal)) await onSignal();
    },
    onShutdown: async () => {
      if (isFn(onShutdown)) await onShutdown();
    },
    beforeShutdown: async () => {
      if (isFn(beforeShutdown)) await beforeShutdown();
      const { TERMINUS_SHUTDOWN_DELAY } = env;
      if (TERMINUS_SHUTDOWN_DELAY) await wait(TERMINUS_SHUTDOWN_DELAY);
    },
  });

  return new Promise((res, rej) => {
    server.listen(port, function listen(err) {
      if (err) {
        rej(err);
      } else {
        res(this);
        if (process.send) {
          process.send({
            event: 'ready',
            name: sitePackage.name,
            tenantKey,
            graphqlUri,
            location: `http://${exposedHost}:${exposedPort}`,
          });
        }
      }
    });
  }).catch(e => setImmediate(() => { throw e; }));
};
