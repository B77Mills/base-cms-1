const { filterDsn } = require('@parameter1/base-cms-db/utils');
const mongodb = require('mongodb');

const { GOOGLE_DATA_MONGO_DSN } = require('./env');

const { log } = console;

let connection;

const connect = async () => {
  if (!connection) {
    connection = await mongodb.connect(GOOGLE_DATA_MONGO_DSN, { useNewUrlParser: true });
    const url = filterDsn(connection);
    log(`> MongoDB connected (${url})`);
  }
  return connection;
};

const getCollection = async (name) => {
  const conn = await connect();
  return conn.db('google-data-api').collection(name);
};

module.exports = {
  connect,
  ping: async () => {
    const coll = await getCollection('pings');
    return coll.updateOne({ ping: 'pong' }, { $set: { last: new Date() } }, { upsert: true });
  },
  retrieve: async (url) => {
    const coll = await getCollection('responses');
    return coll.findOne({ url });
  },
  write: async (url, response, ttl) => {
    const coll = await getCollection('responses');
    const expires = new Date(Date.now() + ttl * 1000);
    const retrieved = new Date();
    return coll.updateOne({ url }, { $set: { expires, retrieved, response } }, { upsert: true });
  },
};
