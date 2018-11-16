const { ServiceBroker } = require('moleculer');
const { NATS_DSN, NATS_LOGLEVEL } = require('./env');

module.exports = (options = {}) => new ServiceBroker({
  namespace: 'base-cms',
  transporter: NATS_DSN,
  logLevel: NATS_LOGLEVEL,
  logFormatter: 'simple',
  ...options,
});