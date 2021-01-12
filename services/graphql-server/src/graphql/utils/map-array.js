const { asArray } = require('@parameter1/base-cms-utils');

module.exports = (value, field) => asArray(value).reduce((map, item) => {
  const key = `${item[field]}`;
  map.set(key, item);
  return map;
}, new Map());
