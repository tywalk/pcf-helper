import { spawn } from 'child_process';
import { version } from '../package.json';

test('session displays version', (done) => {
  const task = spawn('node', ['./dist/bin/session.js', '-v']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    expect(output).toContain(version);
    expect(code).toBe(0);
    done?.();
  });
}, 10000);

test('session errors if no/wrong args are provided', (done) => {
  const task = spawn('node', ['./dist/bin/session.js', '-e']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    expect(code).toBe(1);
    done?.();
  });
}, 10000);