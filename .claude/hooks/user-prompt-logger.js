#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const prompt = process.argv.slice(2).join(' ');
if (!prompt) process.exit(0);

const root = process.cwd();
const dir = path.join(root, '.claude', 'logs');
const file = path.join(dir, 'prompts.jsonl');
fs.mkdirSync(dir, { recursive: true });

const row = {
  timestamp: new Date().toISOString(),
  prompt
};

fs.appendFileSync(file, JSON.stringify(row) + '\n', 'utf8');
