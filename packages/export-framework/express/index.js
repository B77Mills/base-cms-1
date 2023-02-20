const express = require('express');
const { cleanMarkoResponse, markoMiddleware } = require('@parameter1/base-cms-marko-express/middleware');
const helmet = require('helmet');
const apollo = require('./apollo');
const { version } = require('../package.json');
const admin = require('../admin');
const templateRouter = require('./template-router');

/**
 */
module.exports = (config = {}) => {
  const {
    sitePackage,
    exports,
    coreConfig,
    customConfig,
  } = config;
  const app = express();

  // Add async block error handler.
  app.locals.onAsyncBlockError = config.onAsyncBlockError;

  // Set the core config.
  app.locals.config = coreConfig;

  // Set custom configuration.
  app.locals.customConfig = customConfig;

  // Use helmet.
  app.use(helmet());

  // Apply request origin.
  app.use((req, res, next) => {
    res.locals.requestOrigin = `${req.protocol}://${req.get('host')}`;
    next();
  });

  // Apply versions.
  app.use((req, res, next) => {
    res.set('x-version', `${sitePackage.version}|${version}`);
    next();
  });

  // Register apollo.
  app.use(apollo({
    uri: config.graphqlUri,
    name: sitePackage.name,
    tenantKey: config.tenantKey,
  }));

  // Register the Marko middleware.
  app.use(markoMiddleware());
  app.use(cleanMarkoResponse());

  // Register newsletter "admin application."
  app.use('/', admin({ exports }));

  // Register exports
  app.use('/exports', templateRouter({ exports, coreConfig, customConfig }));

  return app;
};
