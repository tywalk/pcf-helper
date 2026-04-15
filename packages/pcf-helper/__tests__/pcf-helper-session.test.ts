/// <reference types="jest" />
/// <reference types="node" />

import { spawn } from 'child_process';
import { version } from '../package.json';
import { buildBeforeAll } from './setup/buildBeforeAll';

beforeAll(buildBeforeAll, 60000);

test('session displays version', (done) => {
  const task = spawn('node', ['./dist/bin/session.js', '-v']);

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
    done?.();
  });
}, 10000);

test('session errors if no/wrong args are provided', (done) => {
  const task = spawn('node', ['./dist/bin/session.js', '-e']);

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
    done?.();
  });
}, 10000);

test('session errors if path does not exist', (done) => {
  const task = spawn('node', ['./dist/bin/session.js', '-p', '/path/that/does/not/exist']);

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
    done?.();
  });
}, 10000);