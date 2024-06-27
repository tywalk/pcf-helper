const { spawnSync } = require('child_process');
const { formatMsToSec } = require('../util/performanceUtil');

function run(path) {
  console.log('[PCF Helper] Starting upgrade...\n');
  const tick = performance.now();
  const task = spawnSync(`pac solution version -s Solution -sp ${path} && pac pcf version -s Manifest && npm version patch --no-git-tag-version`, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 // 1 min
  });
  const tock = performance.now();

  if (task.status === 0) {
    console.log('[PCF Helper] Upgrade complete!');
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        console.error('[PCF Helper] Unable to complete upgrade. A timeout of 1 minutes was reached.', task.error.message);
      } else {
        console.error('[PCF Helper] Unable to complete upgrade:', task.signal, task.error.message);
      }
      console.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
    } else {
      console.error('[PCF Helper] Unable to complete upgrade: One or more errors ocurred.');
    }
    // console.warn('Killing process with id:', task.pid);
    // process.kill(task.pid);
  }
  console.log(formatMsToSec('[PCF Helper] Upgrade finished in %is.\n', tock - tick));
  return task.status;
}

exports.run = run;