import { spawnSync } from 'child_process';
import { join, extname } from 'path';
import fs from 'fs';
import logger from '@tywalk/color-logger';
import { formatTime, handleTaskCompletion } from '../util/performanceUtil';
import { resolveSpawnCommand } from '../util/commandUtil';

function pcfExistsInParent(path: string): string {
  let levels = 0;
  while (levels < 3) {
    const pathFiles = fs.readdirSync(path);
    const atRoot = pathFiles.some(file => extname(file).toLowerCase() === '.pcfproj');
    if (atRoot) {
      return path;
    }
    path = join(path, '..');
    levels++;
  }
  throw new Error('PCF project not found within 3 directory levels.');
}

function runInit(path: string, name: string, publisherName: string, publisherPrefix: string, template: string, framework: string, npm: boolean, verbose: boolean): number {
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Starting init...\n');
  const tick = performance.now();

  path = path ?? process.cwd();

  // Validate template and framework options
  const validTemplates = ['field', 'dataset'];
  const validFrameworks = ['none', 'react'];
  
  if (!validTemplates.includes(template)) {
    logger.error(`[PCF Helper] Invalid template '${template}'. Valid options: ${validTemplates.join(', ')}`);
    return 1;
  }
  
  if (!validFrameworks.includes(framework)) {
    logger.error(`[PCF Helper] Invalid framework '${framework}'. Valid options: ${validFrameworks.join(', ')}`);
    return 1;
  }
  
  const initCommand = resolveSpawnCommand('pac', ['pcf', 'init', '-ns', publisherPrefix, '-n', name, '-t', template, '-fw', framework, '-o', path, '-npm', npm ? 'true' : 'false']);
  const initTask = spawnSync(initCommand.command, initCommand.args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    killSignal: 'SIGKILL',
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  if (initTask.status !== 0) {
    return handleTaskCompletion(initTask, 'init', performance.now() - tick, verbose);
  }

  let pathFiles = fs.readdirSync(path);
  let atRoot = pathFiles.some(file => extname(file).toLowerCase() === '.pcfproj');
  name += 'PCF'; // Prevent cdsproj from conflicting with pcfproj
  const cdsPath = atRoot ? join(path, 'Solutions', name) : join(path, name);

  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Initializing solution...\n');
  const solutionCommand = resolveSpawnCommand('pac', ['solution', 'init', '-pn', publisherName, '-pp', publisherPrefix, '-o', cdsPath]);
  const solutionTask = spawnSync(solutionCommand.command, solutionCommand.args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    killSignal: 'SIGKILL',
    timeout: 1000 * 60 * 5, // 5 minutes
  });

  if (solutionTask.status !== 0) {
    return handleTaskCompletion(solutionTask, 'init', performance.now() - tick, verbose);
  }

  if (!atRoot) {
    try {
      path = pcfExistsInParent(path);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      logger.error(`[PCF Helper] Unable to locate PCF project: ${message}`);
      return 1;
    }
  }

  const pcfProjPath = fs.realpathSync(path);
  logger.log('[PCF Helper] ' + formatTime(new Date()) + ' Adding solution reference...', pcfProjPath);
  const packageCommand = resolveSpawnCommand('pac', ['solution', 'add-reference', '-p', pcfProjPath]);
  const packageTask = spawnSync(packageCommand.command, packageCommand.args, {
    cwd: cdsPath,
    stdio: 'inherit',
    killSignal: 'SIGKILL',
    timeout: 1000 * 60 * 5, // 5 minutes
  });
  return handleTaskCompletion(packageTask, 'init', performance.now() - tick, verbose);
}

export { runInit };