const { get, getAsArray, getAsObject } = require('@parameter1/base-cms-object-path');

module.exports = site => ({
  get: (path, def) => get(site, path, def),
  getAsArray: path => getAsArray(site, path),
  getAsObject: path => getAsObject(site, path),
});
