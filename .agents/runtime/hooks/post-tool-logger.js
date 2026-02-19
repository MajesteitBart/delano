#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const payload = process.argv[2] ? JSON.parse(process.argv[2]) : { type: 'tool_mutation' };
const root = process.cwd();
const dir = path.join(root, '.claude', 'logs');
const file = path.join(dir, 'changes.jsonl');
fs.mkdirSync(dir, { recursive: true });

const row = {
  timestamp: new Date().toISOString(),
  type: payload.type || 'tool_mutation',
  actor: payload.actor || 'runtime',
  meta: payload.meta || {}
};

fs.appendFileSync(file, JSON.stringify(row) + '\n', 'utf8');
