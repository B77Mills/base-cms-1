const { envalid } = require('@parameter1/base-cms-tooling');

const {
  custom,
  cleanEnv,
  bool,
  port,
  str,
  num,
} = envalid;
const { nonemptystr } = custom;

module.exports = cleanEnv(process.env, {
  CACHE_GQL_RESPONSES: bool({ desc: 'Whether to force-enable caching of all GraphQL responses.', default: true, devDefault: false }),
  MONGO_DSN: nonemptystr({ desc: 'The Base MongoDB connection URL.' }),
  REDIS_CACHE_DSN: nonemptystr({ desc: 'The Redis DSN where cache values should be saved.' }),
  GRAPHQL_ENDPOINT: nonemptystr({ desc: 'The GraphQL endpoint', default: '/' }),
  PORT: port({ desc: 'The internal port to run on.', default: 80 }),
  EXPOSED_HOST: str({ desc: 'The external host to run on.', default: 'localhost' }),
  EXPOSED_PORT: port({ desc: 'The external port to run on.', default: 80 }),
  NEW_RELIC_ENABLED: bool({ desc: 'Whether New Relic is enabled.', default: true, devDefault: false }),
  NEW_RELIC_LICENSE_KEY: str({ desc: 'The license key for New Relic.', default: '' }),
  GRAPHQL_CACHE_CONTROL_ENABLED: bool({ desc: 'Whether the GraphQL server should allow cache control (deprecated)', default: false }),
  GRAPHQL_DEBUG_ENABLED: bool({ desc: 'Whether the GraphQL server should use the debug flag', default: false }),
  GRAPHQL_INTROSPECTION_ENABLED: bool({ desc: 'Whether the GraphQL server should allow introspection', default: true }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ desc: 'Whether the GraphQL server should allow the playground to be used.', default: false }),
  GRAPHQL_TRACING_ENABLED: bool({ desc: 'Whether the GraphQL server should allow tracing (deprecated)', default: false }),
  APOLLO_ENGINE_ENABLED: bool({ desc: 'Whether the Apollo Studio engine should be used', default: false }),
  APOLLO_ENGINE_API_KEY: str({ desc: 'The Apollo Studio Engine API key', default: '' }),
  BASE4_REST_USERNAME: str({ desc: 'The Base4 REST API username.', default: '' }),
  BASE4_REST_PASSWORD: str({ desc: 'The Base4 REST API password.', default: '' }),
  GOOGLE_DATA_API_URI: nonemptystr({ desc: 'The Google Data API URI', default: 'http://google-data-api' }),
  TOKEN_SECRET: nonemptystr({ desc: 'The token signing secret.' }),
  TOKEN_NAMESPACE: nonemptystr({ desc: 'The UUIDv4 namespace' }),
  TERMINUS_TIMEOUT: num({ desc: 'Number of milliseconds before forceful exiting', default: 1000 }),
  TERMINUS_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown', default: 10000 }),
  CDN_IMAGE_HOSTNAME: nonemptystr({ desc: 'The default CDN hostname for image delivery', default: 'base.imgix.net' }),
  CDN_ASSET_HOSTNAME: nonemptystr({ desc: 'The default CDN hostname for asset delivery', default: 'cdn.baseplatform.io' }),
  IMAGE_IMPORT_URL: nonemptystr({ desc: 'The BASE image import URL.', default: 'https://opq20fu9p2.execute-api.us-east-1.amazonaws.com/default/base-media-importer' }),
});
