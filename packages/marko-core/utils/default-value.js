const { isFunction } = require('@parameter1/base-cms-utils');

module.exports = (value, def, formatter) => {
  const fn = isFunction(formatter) ? formatter : v => v;
  return value != null ? fn(value) : def;
};
