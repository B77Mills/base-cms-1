const { asObject } = require('@parameter1/base-cms-utils');

module.exports = (input) => {
  const o = asObject(input);
  if (o.show === false) return false;
  if (o.renderBody) return true;
  return false;
};
