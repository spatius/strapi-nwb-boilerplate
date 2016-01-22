'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');
const fs = require('fs');

// Public node modules.
const _ = require('lodash');

module.exports = function() {
  console.log("nwb", arguments, this);
};
