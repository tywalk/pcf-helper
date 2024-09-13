const util = require('node:util');

var formatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

function formatMsToSec(format, ms) {
  const seconds = ms / 1000;
  return util.format(format, seconds);
}

function formatTime(date) {
  return formatter.format(date);
}

module.exports = {
  formatMsToSec,
  formatTime
}