import { spawn } from 'child_process';
import { version } from '../package.json';

test('init displays version', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-v']);

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

test('init errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-p']);

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
    done();
  });
}, 10000);

test('init shows help with template and framework options', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '--help']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    console.log('Output:', output);
    expect(output).toContain('template for the component');
    expect(output).toContain('rendering framework for control');
    expect(code).toBe(0);
    done();
  });
}, 10000);