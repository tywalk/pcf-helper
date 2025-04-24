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

function runInit(path: string, name: string, publisherName: string, publisherPrefix: string, npm: boolean, verbose: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting init...\n');
  const tick = performance.now();

  path = path ?? process.cwd();

  const initTask = spawnSync('pac pcf init', ['-ns', publisherPrefix, '-n', name, '-t', 'field', '-fw', 'react', '-o', path, '-npm', npm ? 'true' : 'false'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  if (initTask.status !== 0) {
    return handleTaskCompletion(initTask, 'init', performance.now() - tick, verbose);
  }

  let pathFiles = fs.readdirSync(path);
  let atRoot = pathFiles.some(file => extname(file).toLowerCase() === '.pcfproj');
  const cdsPath = atRoot ? join(path, 'Solutions', name) : join(path, name);

  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Initializing solution...\n');
  const solutionTask = spawnSync('pac solution init', ['-pn', publisherName, '-pp', publisherPrefix, '-o', cdsPath], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  if (solutionTask.status !== 0) {
    return handleTaskCompletion(solutionTask, 'init', performance.now() - tick, verbose);
  }

  if (!atRoot) {
    path = pcfExistsInParent(path);
  }

  const pcfProjPath = fs.realpathSync(path);
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Adding solution reference...', pcfProjPath);
  const packageTask = spawnSync('pac solution add-reference', ['-p', pcfProjPath], {
    cwd: cdsPath,
    stdio: 'inherit',
    shell: true,
    timeout: 1000 * 60 * 5, // 5 minutes
  });
  return handleTaskCompletion(packageTask, 'init', performance.now() - tick, verbose);
}

export { runInit };