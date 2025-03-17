const { spawn } = require('child_process');
const version = require('../package.json').version;

test('displays version', (done) => {
  const task = spawn('node', ['./index.js', '-v']);

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


test('errors if no path is provided', (done) => {
  const task = spawn('node', ['./index.js', '-p']);

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

test('errors if incorrect command is provided', (done) => {
  const task = spawn('node', ['./index.js', '-p', 'test', 'invalid']);

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