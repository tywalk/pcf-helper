import { spawn } from 'child_process';
import { version } from '../package.json';

test('import displays version', (done) => {
  const task = spawn('node', ['./dist/bin/import.js', '-v']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    expect(output).toContain(version);
    expect(code).toBe(0);
    done();
  });
});

test('import errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/import.js', '-p']);

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
    expect(code).toBe(1);
    clearTimeout(timeout);
    done();
  });
});