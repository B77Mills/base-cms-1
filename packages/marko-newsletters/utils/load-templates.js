const readdir = require('recursive-readdir');
const fs = require('fs');
const path = require('path');

let promise;

const load = async ({ rootDir, templatePath, queryFragment }) => {
  const templateDir = path.resolve(rootDir, templatePath);

  if (!fs.existsSync(templateDir)) throw new Error(`The template directory ${templateDir} does not exist.`);

  const templates = [];
  const files = await readdir(templateDir, ['**/components/*.marko', '!*.marko']);
  files.forEach((file) => {
    const route = file.replace(templateDir, '').replace(/\.marko$/i, '');
    const key = route.replace(/^\//, '');
    const alias = route.split('/')[1];
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const template = require(file);
    templates.push({
      key,
      route,
      alias,
      file,
      template,
      queryFragment,
    });
  });
  return templates;
};

module.exports = ({ rootDir, templatePath, queryFragment }) => {
  if (!promise) promise = load({ rootDir, templatePath, queryFragment });
  return promise;
};
