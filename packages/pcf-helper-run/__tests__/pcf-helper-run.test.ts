import { spawn } from 'child_process';
import { version } from '../package.json';
import * as tasks from '@tywalk/pcf-helper';

test('displays version', (done) => {
  const task = spawn('node', ['./dist/index.js', '--version']);
  
  // Add timeout
  const timeout = setTimeout(() => {
    task.kill();
    done.fail('Test timed out');
  }, 5000);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    clearTimeout(timeout);
    console.log(output);
    expect(output).toContain(version);
    expect(code).toBe(0);
    done();
  });
}, 10000);


test('errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/index.js', 'build']);
  
  // Add timeout
  const timeout = setTimeout(() => {
    task.kill();
    done.fail('Test timed out');
  }, 5000);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    clearTimeout(timeout);
    console.log(output);
    // The command should exit with non-zero code when required path is missing
    expect(code).not.toBe(0);
    done();
  });
}, 10000);

test('errors if incorrect command is provided', (done) => {
  const task = spawn('node', ['./dist/index.js', 'invalidcommand']);
  
  // Add timeout  
  const timeout = setTimeout(() => {
    task.kill();
    done.fail('Test timed out');
  }, 5000);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    clearTimeout(timeout);
    console.log(output);
    // Invalid command should exit with non-zero code
    expect(code).not.toBe(0);
    done();
  });
}, 10000);

test('runBuild exists', () => {
  const exists = typeof tasks?.runBuild === 'function';
  expect(exists).toBe(true);
});