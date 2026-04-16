import { spawn, spawnSync } from 'child_process';
import { version } from '../package.json';
import * as tasks from '@tywalk/pcf-helper';

beforeAll(() => {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('Unable to locate npm executable path from npm_execpath.');
  }

  const build = spawnSync(process.execPath, [npmExecPath, 'run', 'build'], {
    cwd: process.cwd(),
    encoding: 'utf-8'
  });

  if (build.status !== 0) {
    throw new Error(`Failed to build pcf-helper-run before CLI tests.\n${build.error?.message || build.stderr || build.stdout}`);
  }
}, 60000);

test('displays version', (done) => {
  const task = spawn('node', ['./dist/index.js', '--version']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    expect(output).toContain(version);
    expect(code).toBe(0);
    done();
  });
}, 10000);


test('errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/index.js', 'build']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    // The command should exit with non-zero code when required path is missing
    expect(code).not.toBe(0);
    done();
  });
}, 10000);

test('errors if incorrect command is provided', (done) => {
  const task = spawn('node', ['./dist/index.js', 'invalidcommand']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    // Invalid command should exit with non-zero code
    expect(code).not.toBe(0);
    done();
  });
}, 10000);

test('runBuild exists', () => {
  const exists = typeof tasks?.runBuild === 'function';
  expect(exists).toBe(true);
});

test('session errors when watch retry flag is used without watch', (done) => {
  const task = spawn('node', ['./dist/index.js', 'session', '--watch-retry', 'false']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    expect(code).toBe(1);
    done();
  });
}, 10000);