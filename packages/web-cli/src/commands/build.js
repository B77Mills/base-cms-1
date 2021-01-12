const logCmd = require('@parameter1/base-cms-cli-utils/log-command');
const cwd = require('@parameter1/base-cms-cli-utils/get-cwd');
const build = require('../gulp/build');

module.exports = ({ path }) => {
  const dir = cwd(path);
  logCmd('build', dir);
  build(dir)();
};
