require('@parameter1/base-cms-marko-node-require');
const http = require('http');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const { isFunction: isFn, parseBooleanHeader } = require('@parameter1/base-cms-utils');
const errorHandlers = require('./express/error-handlers');
const express = require('./express');
const loadMore = require('./express/load-more');
const disabledFeatures = require('./middleware/disabled-features');

const { env } = process;
if (!process.env.LIVERELOAD_PORT) process.env.LIVERELOAD_PORT = 4010;
if (!process.env.EXPOSED_HOST) process.env.EXPOSED_HOST = env.HOST || 'localhost';

process.on('unhandledRejection', (e) => { throw e; });

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async ({
  rootDir,
  siteConfig,
  coreConfig,
  helmetConfig,
  host = env.HOST,
  port = env.PORT || 4008,
  exposedPort = env.EXPOSED_PORT || env.PORT || 4008,
  exposedHost = env.EXPOSED_HOST,
  routes,
  graphqlUri = env.GRAPHQL_URI,
  tenantKey = env.TENANT_KEY,
  siteId = env.SITE_ID,
  errorTemplate,
  document, // custom marko-web-document component
  components, // components to register globally (e.g. for load more, etc)
  fragments, // fragments to register globally
  embeddedMediaHandlers,
  onAsyncBlockError,
  onFatalError,
  redirectHandler,
  sitemapsHeaders,

  // Base browse (optional)
  baseBrowseGraphqlUri = env.BASE_BROWSE_GRAPHQL_URI,

  // Cache settings.
  gqlCacheResponses = parseBooleanHeader(env.CACHE_GQL_RESPONSES),
  gqlCacheSiteContext = parseBooleanHeader(env.CACHE_GQL_SITE_CONTEXT),

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
  if (!graphqlUri) throw new Error('The GraphQL API URL is required.');
  if (!siteId) throw new Error('A site ID is required.');

  // Load the site package file.
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const sitePackage = require(path.resolve(rootDir, 'package.json'));

  const app = express({
    rootDir,
    siteConfig,
    coreConfig,
    helmetConfig,
    graphqlUri,
    tenantKey,
    siteId,
    onAsyncBlockError,
    onFatalError,
    document,
    components,
    fragments,
    sitePackage,
    embeddedMediaHandlers,
    sitemapsHeaders,
    gqlCacheResponses,
    gqlCacheSiteContext,
    baseBrowseGraphqlUri,
  });

  app.use(disabledFeatures());

  // Await required services here...
  if (isFn(onStart)) await onStart(app);

  // Register load more after onStart to ensure userland middleware is available.
  loadMore(app);

  // Load website routes.
  if (!isFn(routes)) throw new Error('A routes function is required.');
  routes(app);

  // Apply error handlers.
  errorHandlers(app, {
    template: errorTemplate,
    redirectHandler,
    onFatalError: onFatalError || onAsyncBlockError,
  });

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
    server.listen(port, host, function listen(err) {
      if (err) {
        rej(err);
      } else {
        res(this);
        if (process.send) {
          process.send({
            event: 'ready',
            name: sitePackage.name,
            siteId,
            graphqlUri,
            baseBrowseGraphqlUri,
            location: `http://${exposedHost}:${exposedPort}`,
          });
        }
      }
    });
  }).catch(e => setImmediate(() => { throw e; }));
};
