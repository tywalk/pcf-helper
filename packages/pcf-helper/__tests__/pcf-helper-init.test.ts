import { spawn } from 'child_process';
import { version } from '../package.json';

test('init displays version', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-v']);

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
    console.log(output);
    expect(code).toBe(1);
    done();
  });
});

// test('init creates pcf', () => {
//   logger.setDebug(true);
//   const result = runInit('./tests', 'test', 'testpb', 'tb', false, true);
//   expect(result).toBe(0);
// });