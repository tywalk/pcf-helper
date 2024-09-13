const { spawnSync } = require('child_process');
const { formatMsToSec, formatTime } = require('../util/performanceUtil');

function run(path) {
  console.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting build...\n');
  const tick = performance.now();
  const task = spawnSync('dotnet build', ['--restore', '-c', 'Release', path], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5 // 5 minutes
  });
  const tock = performance.now();

  if (task.status === 0) {
    console.log('[PCF Helper] Build complete!');
    console.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Build finished in %is.\n', tock - tick));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        console.error('[PCF Helper] Unable to complete build. A timeout of 5 minutes was reached.', task.error.message);
      } else {
        console.error('[PCF Helper] Unable to complete build: ', task.signal, task.error.message);
      }
      console.debug('[PCF Helper] Error details: ', task.signal, task.error.stack);
    } else {
      console.error('[PCF Helper] Unable to complete build: One or more errors ocurred.');
    }
    console.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Build finished with errors in %is.\n', tock - tick));
  }
  return task.status;
}

exports.run = run;