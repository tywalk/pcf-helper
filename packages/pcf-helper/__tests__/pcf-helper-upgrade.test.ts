import { spawn } from 'child_process';
import { version } from '../package.json';

test('upgrade displays version', (done) => {
  const task = spawn('node', ['./dist/bin/upgrade.js', '-v']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    console.log(output);
    expect(output).toContain(version);
    expect(code).toBe(0);
    done();
  });
});

test('upgrade errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/upgrade.js', '-p']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  task.on('close', (code) => {
    console.log(output);
    expect(code).toBe(1);
    done();
  });
});