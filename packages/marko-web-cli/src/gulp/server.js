const livereload = require('gulp-livereload');
const log = require('fancy-log');
const { green, yellow, magenta } = require('chalk');
const { spawn } = require('child_process');

module.exports = (file) => {
  let node;
  return async () => {
    if (node) node.kill();
    node = await spawn('node', [file], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
    node.on('message', (msg) => {
      if (msg.event === 'ready') {
        log(`Server ${green('ready')} on ${yellow(msg.location)}`);
        livereload.changed('/');
      }
    });
    node.on('close', (code, signal) => {
      const exited = [];
      if (code) exited.push(`code ${magenta(code)}`);
      if (signal) exited.push(`signal ${magenta(signal)}`);
      log(`Process ${green('exited')} with ${exited.join(' ')}`);
    });
  };
};
