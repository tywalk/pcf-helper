import { spawnSync } from 'child_process';
import { join, extname } from 'path';
import fs from 'fs';
import logger from '@tywalk/color-logger';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';

function pcfExistsInParent(path: string) {
  let levels = 0;
  while (levels < 3) {
    let pathFiles = fs.readdirSync(path);
    let atRoot = pathFiles.some(file => extname(file).toLowerCase() === '.pcfproj');
    if (atRoot) {
      return path;
    }
    path = join(path, '..');
    levels++;
  }
  throw new Error('PCF project not found.');
}

function run(path: string, name: string, publisherName: string, publisherPrefix: string, verbose: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting init...\n');
  const tick = performance.now();

  path = path ?? process.cwd();
  let pathFiles = fs.readdirSync(path);
  let atRoot = pathFiles.some(file => extname(file).toLowerCase() === '.pcfproj');
  const cdsPath = atRoot ? join(path, 'Solutions', name) : join(path, name);

  const initTask = spawnSync('pac solution init', ['-pn', publisherName, '-pp', publisherPrefix, '-o', cdsPath], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  if (initTask.status !== 0) {
    return handleTaskCompletion(initTask, 'init', performance.now() - tick, verbose);
  }

  if (!atRoot) {
    path = pcfExistsInParent(path);
  }

  const packageTask = spawnSync('pac solution add-reference', ['-p', path], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });
  return handleTaskCompletion(packageTask, 'init', performance.now() - tick, verbose);
}

export { run };