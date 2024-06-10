const util = require('node:util');

function formatMsToSec(format, ms) {
  const seconds = ms / 1000;
  return util.format(format, seconds);
}

module.exports = {
  formatMsToSec
}