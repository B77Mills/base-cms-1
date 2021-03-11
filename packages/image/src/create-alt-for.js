const { titleize } = require('@parameter1/base-cms-inflector');
const { htmlEntities, stripHtml } = require('@parameter1/base-cms-html');

const altFrom = (value = '') => {
  if (!value) return '';
  const v = String(value);
  const pos = v.lastIndexOf('.');
  if (pos === -1) return v;
  const offset = v.length - pos;
  if (offset < 6) {
    const replaced = v.replace(v.substring(pos), '');
    const titleized = titleize(replaced);
    return titleized.replace(/\./g, ' ');
  }
  return v;
};

const clean = v => htmlEntities.encode(stripHtml(v));

module.exports = ({
  displayName,
  caption,
  name,
  fileName,
} = {}) => {
  if (displayName) return clean(displayName);
  if (caption) return clean(caption);
  if (name) return clean(altFrom(name));
  return clean(altFrom(fileName));
};
