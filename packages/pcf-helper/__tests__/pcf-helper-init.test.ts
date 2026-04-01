import { spawn } from 'child_process';
import { version } from '../package.json';

test('init displays version', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-v']);

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

test('init errors if no path is provided', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '-p']);

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

test('init shows help with template and framework options', (done) => {
  const task = spawn('node', ['./dist/bin/init.js', '--help']);

  let output = '';
  task.stdout.on('data', (data) => {
    output += data.toString();
  });

  task.on('close', (code) => {
    expect(output).toContain('template for the component (field|dataset)');
    expect(output).toContain('rendering framework for control (none|react)');
    expect(code).toBe(0);
    done();
  });
});

// test('init creates pcf', () => {
//   logger.setDebug(true);
//   const result = runInit('./tests', 'test', 'testpb', 'tb', 'field', 'react', false, true);
//   expect(result).toBe(0);
// });