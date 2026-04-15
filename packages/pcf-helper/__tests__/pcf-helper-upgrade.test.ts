import { spawn } from 'child_process';
import { version } from '../package.json';
import { buildBeforeAll } from './setup/buildBeforeAll';

beforeAll(buildBeforeAll, 60000);

test('upgrade displays version', (done) => {
  const task = spawn('node', ['./dist/bin/upgrade.js', '-v']);

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

test('upgrade errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/upgrade.js', '-p']);

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