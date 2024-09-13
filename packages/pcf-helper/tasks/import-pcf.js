const { spawnSync } = require('child_process');
const { join, extname } = require('path');
const fs = require('fs');
const { formatMsToSec, formatTime } = require('../util/performanceUtil');

function run(path, env, verbose) {
  console.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting import...\n');
  const tick = performance.now();
  if (!env) {
    console.warn('Path argument not provided. Assuming active auth profile organization.');
  }

  const zipDirPath = join(path, '/bin/release');
  // const zipDirPath = join(path, '');
  const zipDirFiles = fs.readdirSync(zipDirPath);
  const zipFile = zipDirFiles.find(file => extname(file).toLowerCase() === '.zip');
  const zipFilePath = join(zipDirPath, zipFile);

  const task = spawnSync('pac solution import', ['-env', env, '-p', zipFilePath, '-pc'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });
  const tock = performance.now();

  if (task.status === 0) {
    console.log('[PCF Helper] Import complete!');
    console.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Import finished in %is.\n', tock - tick));
  } else {
    if (task.error) {
      if (task.signal === 'SIGTERM') {
        console.error('[PCF Helper] Unable to complete import. A timeout of 5 minutes was reached.', task.error.message);
      } else {
        console.error('[PCF Helper] Unable to complete import:', task.signal, task.error.message);
      }
      if (verbose) {
        console.debug('[PCF Helper] Error details:', task.signal, task.error.stack);
      }
    } else {
      console.error('[PCF Helper] Unable to complete import: One or more errors ocurred.');
    }
    console.log(formatMsToSec('[PCF Helper] ' + formatTime(new Date()) + ' Import finished with errors in %is.\n', tock - tick));
  }
  return task.status;
}

exports.run = run;