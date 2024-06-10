#!/usr/bin/env node
const { spawnSync } = require('child_process');
console.log(process.cwd());
const task = spawnSync('ls bin', {
  cwd: process.cwd(),
  shell: true
});

console.log('Test complete!: ', task.status);