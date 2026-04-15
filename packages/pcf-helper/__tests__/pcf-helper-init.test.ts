import { spawn } from 'child_process';
import { version } from '../package.json';
import { buildBeforeAll } from './setup/buildBeforeAll';

beforeAll(buildBeforeAll, 60000);

test('init displays version', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-v']);

  let output = '';
  let stderrOutput = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    stderrOutput += data.toString();
  });

  task.on('close', (code) => {
    expect({ code, output, stderr: stderrOutput }).toMatchObject({ code: 0 });
    expect(output).toContain(version);
    done();
  });
}, 10000);

test('init errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-p']);

  let output = '';
  let stderrOutput = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    stderrOutput += data.toString();
  });

  task.on('close', (code) => {
    expect({ code, output, stderr: stderrOutput }).toMatchObject({ code: 1 });
    done();
  });
}, 10000);

test('init shows help with template and framework options', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '--help']);

  let output = '';
  let stderrOutput = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.stderr.on('data', (data) => {
    stderrOutput += data.toString();
  });

  task.on('close', (code) => {
    expect({ code, output, stderr: stderrOutput }).toMatchObject({ code: 0 });
    expect(output).toContain('template for the component');
    expect(output).toContain('rendering framework for control');
    done();
  });
}, 10000);