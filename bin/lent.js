#!/usr/bin/env node
const crateLent = require('../dist/index.js');

crateLent.lent().http.start();
