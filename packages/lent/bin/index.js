#!/usr/bin/env node
const { lent } = require('../dist/index.js');

lent().then((v) => v.start());
