const { dasherize } = require('@parameter1/base-cms-inflector');
const { htmlEntities } = require('@parameter1/base-cms-html');
const {
  TAG_ATTR_PREFIX,
} = require('../constants');

module.exports = (key, value) => {
  if (!key || value == null) return null; // ignore null and undefined
  const k = `${TAG_ATTR_PREFIX}-${dasherize(key)}`;
  const v = htmlEntities.encode(value);
  return `${k}="${v}"`;
};
