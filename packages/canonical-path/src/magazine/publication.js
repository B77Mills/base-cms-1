const { isFunction: isFn, cleanPath } = require('@parameter1/base-cms-utils');

const pathResolvers = {
  id: ({ _id }) => _id,
};

module.exports = async (issue, ctx) => {
  const { canonicalRules } = ctx;
  const { magazinePublication } = canonicalRules;
  const { parts, prefix } = magazinePublication;

  const values = await Promise.all(parts.map((key) => {
    const fn = pathResolvers[key];
    return isFn(fn) ? fn(issue, ctx) : issue[key];
  }));

  const path = cleanPath(values.filter(v => v).map(v => String(v).trim()).join('/'));
  if (!path) return '/';
  if (prefix) return `/${cleanPath(prefix)}/${path}`;
  return `/${path}`;
};
